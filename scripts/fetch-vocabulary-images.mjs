#!/usr/bin/env node
/* global process, console, setTimeout, fetch, Buffer */

/**
 * Fetch vocabulary images from the ARASAAC API.
 *
 * Usage:
 *   node scripts/fetch-vocabulary-images.mjs                    # full run with interactive resolve
 *   node scripts/fetch-vocabulary-images.mjs --no-interactive   # auto-fetch only, skip prompts
 *   node scripts/fetch-vocabulary-images.mjs --category=fruits  # single category
 *   node scripts/fetch-vocabulary-images.mjs --force            # re-download everything
 *   node scripts/fetch-vocabulary-images.mjs --word=block 4935  # download specific ID for a word and set as canonical
 *
 * See scripts/arasaac-api.md for API documentation.
 */

import fs from 'node:fs'
import path from 'node:path'
import { createInterface } from 'node:readline'

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const ARASAAC_SEARCH_URL = 'https://api.arasaac.org/v1/pictograms/en/search'
const ARASAAC_IMAGE_URL = 'https://api.arasaac.org/v1/pictograms'
const IMAGE_RESOLUTION = 500
const REQUEST_DELAY_MS = 200
const MAX_VARIANTS_PER_WORD = 5
const VOCAB_FILE = path.resolve('src/i18n/translations/vocabulary.ts')
const OUTPUT_DIR = path.resolve('src/public/images/vocabulary')
const RESOLVED_FILE = path.resolve('scripts/resolved-mappings.json')
const REVIEW_HTML = path.resolve('scripts/image-review.html')
const REPORT_FILE = path.resolve('scripts/coverage-report.json')

// ---------------------------------------------------------------------------
// CLI flags
// ---------------------------------------------------------------------------

const args = process.argv.slice(2)
const forceMode = args.includes('--force')
const noInteractive = args.includes('--no-interactive')
const categoryFlag = args.find(a => a.startsWith('--category='))
const filterCategory = categoryFlag ? categoryFlag.split('=')[1] : null
const wordFlag = args.find(a => a.startsWith('--word='))
const singleWord = wordFlag ? wordFlag.split('=')[1] : null
const singleWordId = singleWord ? args.find(a => /^\d+$/.test(a)) : null

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function slugify(word) {
  return word
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function fetchJson(url) {
  const res = await fetch(url)
  if (!res.ok) return null
  return res.json()
}

async function downloadImage(id, destPath) {
  const url = `${ARASAAC_IMAGE_URL}/${id}?resolution=${IMAGE_RESOLUTION}`
  const res = await fetch(url)
  if (!res.ok) return false
  const buffer = Buffer.from(await res.arrayBuffer())
  fs.mkdirSync(path.dirname(destPath), { recursive: true })
  fs.writeFileSync(destPath, buffer)
  return true
}

function prompt(question) {
  const rl = createInterface({ input: process.stdin, output: process.stdout })
  return new Promise(resolve => {
    rl.question(question, answer => {
      rl.close()
      resolve(answer.trim())
    })
  })
}

// ---------------------------------------------------------------------------
// Parse vocabulary.ts to extract English words
// ---------------------------------------------------------------------------

function parseVocabulary() {
  const content = fs.readFileSync(VOCAB_FILE, 'utf-8')

  // Extract only VOCABULARY_EN block (between line 4 and the start of VOCABULARY_RU)
  const enStart = content.indexOf('const VOCABULARY_EN')
  const ruStart = content.indexOf('const VOCABULARY_RU')
  const enBlock = content.slice(enStart, ruStart)

  const categories = []
  // Match each category object
  const catRegex =
    /\{\s*id:\s*'([^']+)',\s*sectionId:\s*'([^']+)',\s*name:\s*'([^']+)',\s*words:\s*\{([\s\S]*?)\},?\s*\}/g
  let catMatch
  while ((catMatch = catRegex.exec(enBlock)) !== null) {
    const [, id, sectionId, name, wordsBlock] = catMatch
    const words = {}
    for (const difficulty of ['simple', 'medium', 'complex']) {
      const diffRegex = new RegExp(`${difficulty}:\\s*\\[([\\s\\S]*?)\\]`)
      const diffMatch = wordsBlock.match(diffRegex)
      if (diffMatch) {
        const wordList = []
        const wordRegex = /'([^']+)'/g
        let wm
        while ((wm = wordRegex.exec(diffMatch[1])) !== null) {
          wordList.push(wm[1])
        }
        words[difficulty] = wordList
      }
    }
    categories.push({ id, sectionId, name, words })
  }
  return categories
}

// ---------------------------------------------------------------------------
// Load/save resolved mappings
// ---------------------------------------------------------------------------

function loadResolved() {
  if (fs.existsSync(RESOLVED_FILE)) {
    return JSON.parse(fs.readFileSync(RESOLVED_FILE, 'utf-8'))
  }
  return {}
}

function saveResolved(resolved) {
  fs.writeFileSync(RESOLVED_FILE, JSON.stringify(resolved, null, 2) + '\n')
}

// ---------------------------------------------------------------------------
// Check if canonical image exists for a word
// ---------------------------------------------------------------------------

function canonicalPath(categoryId, word) {
  return path.join(OUTPUT_DIR, categoryId, `${slugify(word)}.png`)
}

function hasCanonicalImage(categoryId, word) {
  return fs.existsSync(canonicalPath(categoryId, word))
}

function getExistingVariants(categoryId, word) {
  const dir = path.join(OUTPUT_DIR, categoryId)
  if (!fs.existsSync(dir)) return []
  const prefix = `${slugify(word)}_`
  return fs.readdirSync(dir).filter(f => f.startsWith(prefix) && f.endsWith('.png'))
}

// ---------------------------------------------------------------------------
// Phase 1: Auto-fetch
// ---------------------------------------------------------------------------

async function autoFetch(categories) {
  const results = []
  let matched = 0
  let skipped = 0
  let unmatched = 0
  const total = categories.reduce(
    (sum, cat) =>
      sum +
      (cat.words.simple?.length || 0) +
      (cat.words.medium?.length || 0) +
      (cat.words.complex?.length || 0),
    0
  )
  let processed = 0

  for (const category of categories) {
    console.log(`\n📁 ${category.name} (${category.id})`)

    for (const difficulty of ['simple', 'medium', 'complex']) {
      const words = category.words[difficulty] || []
      for (let i = 0; i < words.length; i++) {
        const word = words[i]
        const slug = slugify(word)
        processed++

        // Skip if canonical image exists (unless --force)
        if (!forceMode && hasCanonicalImage(category.id, word)) {
          const variants = getExistingVariants(category.id, word)
          results.push({
            categoryId: category.id,
            difficulty,
            word,
            slug,
            status: 'existing',
            variants: variants.map(f => f.replace('.png', '').split('_').pop()),
          })
          matched++
          process.stdout.write(`  ✓ ${word} (cached)\n`)
          continue
        }

        // Search ARASAAC
        const searchUrl = `${ARASAAC_SEARCH_URL}/${encodeURIComponent(word)}`
        let searchResults = await fetchJson(searchUrl)
        await sleep(REQUEST_DELAY_MS)

        // Fallback: try individual words if multi-word search fails
        if ((!searchResults || searchResults.length === 0) && word.includes(' ')) {
          const parts = word.split(/\s+/)
          for (const part of parts) {
            if (part.length < 3) continue
            searchResults = await fetchJson(`${ARASAAC_SEARCH_URL}/${encodeURIComponent(part)}`)
            await sleep(REQUEST_DELAY_MS)
            if (searchResults && searchResults.length > 0) break
          }
        }

        if (!searchResults || searchResults.length === 0) {
          results.push({
            categoryId: category.id,
            difficulty,
            word,
            slug,
            status: 'unmatched',
            variants: [],
          })
          unmatched++
          process.stdout.write(`  ❌ ${word} (${processed}/${total})\n`)
          continue
        }

        // Download top variants (capped to avoid flooding)
        const dir = path.join(OUTPUT_DIR, category.id)
        fs.mkdirSync(dir, { recursive: true })
        const downloadedIds = []
        const toDownload = searchResults.slice(0, MAX_VARIANTS_PER_WORD)

        for (const result of toDownload) {
          const variantPath = path.join(dir, `${slug}_${result._id}.png`)
          if (!forceMode && fs.existsSync(variantPath)) {
            downloadedIds.push(result._id)
            continue
          }
          const ok = await downloadImage(result._id, variantPath)
          if (ok) {
            downloadedIds.push(result._id)
          }
          await sleep(REQUEST_DELAY_MS)
        }

        // Copy first variant as canonical
        if (downloadedIds.length > 0) {
          const firstVariant = path.join(dir, `${slug}_${downloadedIds[0]}.png`)
          const canonical = canonicalPath(category.id, word)
          fs.copyFileSync(firstVariant, canonical)
        }

        results.push({
          categoryId: category.id,
          difficulty,
          word,
          slug,
          status: downloadedIds.length > 0 ? 'matched' : 'unmatched',
          variants: downloadedIds,
        })

        if (downloadedIds.length > 0) {
          matched++
          process.stdout.write(
            `  ✓ ${word} (${downloadedIds.length} variants, ${processed}/${total})\n`
          )
        } else {
          unmatched++
          process.stdout.write(`  ❌ ${word} — download failed (${processed}/${total})\n`)
        }
      }
    }
  }

  console.log(
    `\n📊 Auto-fetch complete: ${matched} matched, ${skipped} cached, ${unmatched} unmatched out of ${total}`
  )
  return results
}

// ---------------------------------------------------------------------------
// Phase 2: Interactive resolve
// ---------------------------------------------------------------------------

async function interactiveResolve(results) {
  const resolved = loadResolved()
  const unmatchedResults = results.filter(
    r => r.status === 'unmatched' && !resolved[`${r.categoryId}/${r.slug}`]
  )

  if (unmatchedResults.length === 0) {
    console.log('\n✅ No unmatched words to resolve.')
    return results
  }

  console.log(`\n🔍 Interactive resolution: ${unmatchedResults.length} unmatched words.`)
  console.log('   Enter an ARASAAC ID to download, or press Enter to skip.\n')

  const skipped = []

  for (const entry of unmatchedResults) {
    const key = `${entry.categoryId}/${entry.slug}`
    const searchSuggestion = `arasaac.org/pictograms/search/${encodeURIComponent(entry.word)}`

    const answer = await prompt(
      `❌ "${entry.word}" (${entry.categoryId})\n   Try: ${searchSuggestion}\n   ARASAAC ID (Enter to skip): `
    )

    if (!answer) {
      skipped.push(entry)
      resolved[key] = 'skip'
      console.log('   → Skipped\n')
      continue
    }

    const id = parseInt(answer, 10)
    if (isNaN(id)) {
      console.log('   → Invalid ID, skipping\n')
      skipped.push(entry)
      resolved[key] = 'skip'
      continue
    }

    const dir = path.join(OUTPUT_DIR, entry.categoryId)
    fs.mkdirSync(dir, { recursive: true })
    const variantPath = path.join(dir, `${entry.slug}_${id}.png`)
    const ok = await downloadImage(id, variantPath)

    if (ok) {
      // Copy as canonical
      fs.copyFileSync(variantPath, canonicalPath(entry.categoryId, entry.word))
      entry.status = 'resolved'
      entry.variants = [id]
      resolved[key] = id
      console.log(`   ✓ Downloaded ${entry.categoryId}/${entry.slug}_${id}.png\n`)
    } else {
      console.log(`   ✗ Download failed for ID ${id}\n`)
      skipped.push(entry)
      resolved[key] = 'skip'
    }
  }

  saveResolved(resolved)

  if (skipped.length > 0) {
    console.log(`\n⏭️  Skipped words (${skipped.length}):`)
    for (const s of skipped) {
      console.log(`   - ${s.word} (${s.categoryId})`)
    }
  }

  return results
}

// ---------------------------------------------------------------------------
// Phase 3: Generate review gallery + report
// ---------------------------------------------------------------------------

function generateReviewHtml(results, categories) {
  const categoriesById = Object.fromEntries(categories.map(c => [c.id, c]))

  let html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Vocabulary Images Review</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: system-ui, sans-serif; background: #f5f5f5; padding: 24px; }
  h1 { font-size: 24px; margin-bottom: 8px; }
  .summary { color: #666; margin-bottom: 24px; }
  .category { margin-bottom: 32px; }
  .category h2 { font-size: 18px; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid #ddd; }
  .words { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px; }
  .word-card { background: white; border-radius: 12px; padding: 12px; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
  .word-card.unmatched { border: 2px solid #ef4444; background: #fef2f2; }
  .word-card .label { font-weight: 600; font-size: 14px; margin-bottom: 8px; }
  .word-card .difficulty { font-size: 11px; color: #999; margin-bottom: 4px; }
  .word-card .meta { font-size: 11px; color: #888; margin-top: 4px; }
  .variants { display: flex; gap: 6px; justify-content: center; flex-wrap: wrap; }
  .variants img { width: 80px; height: 80px; object-fit: contain; border: 1px solid #eee; border-radius: 8px; background: white; }
  .canonical { border: 2px solid #22c55e !important; }
  .placeholder { opacity: 0.3; }
  .stats { display: flex; gap: 24px; margin-bottom: 16px; }
  .stat { padding: 12px 20px; background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
  .stat .num { font-size: 28px; font-weight: 700; }
  .stat .lbl { font-size: 12px; color: #888; }
</style>
</head>
<body>
<h1>Vocabulary Images Review</h1>
<p class="summary">Generated by fetch-vocabulary-images.mjs</p>
`

  const matchedCount = results.filter(r =>
    ['matched', 'existing', 'resolved'].includes(r.status)
  ).length
  const unmatchedCount = results.filter(r => r.status === 'unmatched').length

  html += `<div class="stats">
  <div class="stat"><div class="num">${results.length}</div><div class="lbl">Total words</div></div>
  <div class="stat"><div class="num" style="color:#22c55e">${matchedCount}</div><div class="lbl">Matched</div></div>
  <div class="stat"><div class="num" style="color:#ef4444">${unmatchedCount}</div><div class="lbl">Unmatched</div></div>
</div>`

  // Group by category
  const byCategory = {}
  for (const r of results) {
    if (!byCategory[r.categoryId]) byCategory[r.categoryId] = []
    byCategory[r.categoryId].push(r)
  }

  for (const catId of Object.keys(byCategory)) {
    const cat = categoriesById[catId]
    const catResults = byCategory[catId]
    const catMatched = catResults.filter(r => r.status !== 'unmatched').length

    html += `<div class="category">
<h2>${cat?.name || catId} — ${catMatched}/${catResults.length}</h2>
<div class="words">`

    for (const r of catResults) {
      const isUnmatched = r.status === 'unmatched'
      html += `<div class="word-card${isUnmatched ? ' unmatched' : ''}">
  <div class="difficulty">${r.difficulty}</div>
  <div class="label">${r.word}</div>
  <div class="variants">`

      if (r.variants.length > 0) {
        // Show canonical first
        html += `<img class="canonical" src="../src/public/images/vocabulary/${r.categoryId}/${r.slug}.png" alt="${r.word}" title="canonical">`
        // Then variants
        for (const vid of r.variants) {
          html += `<img src="../src/public/images/vocabulary/${r.categoryId}/${r.slug}_${vid}.png" alt="${r.word}" title="ID: ${vid}">`
        }
      } else {
        html += `<img class="placeholder" src="../src/public/images/vocabulary/placeholder.png" alt="placeholder">`
      }

      html += `</div>
  <div class="meta">${r.variants.length > 0 ? `IDs: ${r.variants.join(', ')}` : 'No match'}</div>
</div>`
    }

    html += `</div></div>`
  }

  html += `</body></html>`
  fs.writeFileSync(REVIEW_HTML, html)
  console.log(`\n📄 Review gallery: ${REVIEW_HTML}`)
}

function generateReport(results) {
  fs.writeFileSync(REPORT_FILE, JSON.stringify(results, null, 2) + '\n')
  console.log(`📋 Coverage report: ${REPORT_FILE}`)
}

// ---------------------------------------------------------------------------
// Also apply previously resolved mappings
// ---------------------------------------------------------------------------

async function applyResolvedMappings(results) {
  const resolved = loadResolved()
  let applied = 0

  for (const entry of results) {
    if (entry.status !== 'unmatched') continue

    const key = `${entry.categoryId}/${entry.slug}`
    const mapping = resolved[key]

    if (!mapping || mapping === 'skip') continue

    const id = typeof mapping === 'number' ? mapping : parseInt(mapping, 10)
    if (isNaN(id)) continue

    // Check if already downloaded
    const variantPath = path.join(OUTPUT_DIR, entry.categoryId, `${entry.slug}_${id}.png`)
    if (!fs.existsSync(variantPath)) {
      const ok = await downloadImage(id, variantPath)
      if (!ok) continue
      await sleep(REQUEST_DELAY_MS)
    }

    // Copy as canonical
    fs.copyFileSync(variantPath, canonicalPath(entry.categoryId, entry.word))
    entry.status = 'resolved'
    entry.variants = [id]
    applied++
  }

  if (applied > 0) {
    console.log(`\n🔗 Applied ${applied} previously resolved mappings`)
  }
}

// ---------------------------------------------------------------------------
// Single-word mode: --word=block 4935
// ---------------------------------------------------------------------------

async function singleWordMode(word, arasaacId) {
  const categories = parseVocabulary()
  const slug = slugify(word)
  const id = parseInt(arasaacId, 10)

  // Find which category contains this word
  let foundCategory = null
  for (const cat of categories) {
    for (const difficulty of ['simple', 'medium', 'complex']) {
      if ((cat.words[difficulty] || []).some(w => slugify(w) === slug)) {
        foundCategory = cat
        break
      }
    }
    if (foundCategory) break
  }

  if (!foundCategory) {
    console.error(`❌ Word "${word}" not found in any category`)
    process.exit(1)
  }

  const dir = path.join(OUTPUT_DIR, foundCategory.id)
  fs.mkdirSync(dir, { recursive: true })

  const variantPath = path.join(dir, `${slug}_${id}.png`)
  console.log(`Downloading ARASAAC #${id} for "${word}" (${foundCategory.id})...`)
  const ok = await downloadImage(id, variantPath)

  if (!ok) {
    console.error(`❌ Download failed for ID ${id}`)
    process.exit(1)
  }

  // Set as canonical
  const canonical = path.join(dir, `${slug}.png`)
  fs.copyFileSync(variantPath, canonical)

  // Update resolved mappings
  const resolved = loadResolved()
  resolved[`${foundCategory.id}/${slug}`] = id
  saveResolved(resolved)

  console.log(`✓ ${foundCategory.id}/${slug}.png (ARASAAC #${id})`)
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  // Single-word mode
  if (singleWord) {
    if (!singleWordId) {
      console.error('Usage: --word=block 4935')
      process.exit(1)
    }
    await singleWordMode(singleWord, singleWordId)
    return
  }

  console.log('🖼️  ARASAAC Vocabulary Image Fetcher')
  console.log('====================================')

  if (forceMode) console.log('⚠️  Force mode: re-downloading all images')
  if (noInteractive) console.log('⚠️  Non-interactive mode: skipping manual resolution')
  if (filterCategory) console.log(`⚠️  Category filter: ${filterCategory}`)

  let categories = parseVocabulary()
  console.log(`\n📚 Parsed ${categories.length} categories from vocabulary.ts`)

  if (filterCategory) {
    categories = categories.filter(c => c.id === filterCategory)
    if (categories.length === 0) {
      console.error(`❌ Category "${filterCategory}" not found`)
      process.exit(1)
    }
  }

  const totalWords = categories.reduce(
    (sum, cat) =>
      sum +
      (cat.words.simple?.length || 0) +
      (cat.words.medium?.length || 0) +
      (cat.words.complex?.length || 0),
    0
  )
  console.log(`📝 Total words: ${totalWords}`)

  // Phase 1: Auto-fetch
  const results = await autoFetch(categories)

  // Apply any previously resolved mappings
  await applyResolvedMappings(results)

  // Phase 2: Interactive resolve
  if (!noInteractive) {
    await interactiveResolve(results)
  }

  // Phase 3: Generate outputs
  generateReviewHtml(results, categories)
  generateReport(results)

  // Final summary
  const matched = results.filter(r => ['matched', 'existing', 'resolved'].includes(r.status)).length
  const unmatched = results.filter(r => r.status === 'unmatched').length
  console.log(`\n✅ Done. ${matched}/${results.length} words have images, ${unmatched} unmatched.`)

  if (unmatched > 0 && noInteractive) {
    console.log('   Run without --no-interactive to resolve remaining words.')
  }
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
