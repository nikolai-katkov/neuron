import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'

import { AssessmentProvider } from '../../src/hooks'
import { LanguageProvider } from '../../src/i18n'
import { SECTIONS_BY_LANGUAGE } from '../../src/i18n/translations'
import { SectionsListPage } from '../../src/pages/SectionsListPage'

const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

function renderPage() {
  return render(
    <MemoryRouter>
      <LanguageProvider initialLanguage="en">
        <AssessmentProvider sections={SECTIONS_BY_LANGUAGE.en}>
          <SectionsListPage />
        </AssessmentProvider>
      </LanguageProvider>
    </MemoryRouter>
  )
}

describe('SectionsListPage', () => {
  beforeEach(() => {
    localStorage.clear()
    mockNavigate.mockClear()
  })

  it('renders MAND and TACT cards with progress', () => {
    renderPage()
    expect(screen.getByText('MAND')).toBeInTheDocument()
    expect(screen.getByText('TACT')).toBeInTheDocument()
    expect(screen.getAllByText('0/5')).toHaveLength(2)
  })

  it('renders placeholder sections as coming soon', () => {
    renderPage()
    const comingSoonElements = document.querySelectorAll('[data-t="comingSoon"]')
    expect(comingSoonElements.length).toBe(7)
  })

  it('navigates to MAND intro when MAND card is clicked', async () => {
    renderPage()
    await userEvent.click(screen.getByText('MAND'))
    expect(mockNavigate).toHaveBeenCalledWith('/sections/mand/intro')
  })

  it('navigates to TACT intro when TACT card is clicked', async () => {
    renderPage()
    await userEvent.click(screen.getByText('TACT'))
    expect(mockNavigate).toHaveBeenCalledWith('/sections/tact/intro')
  })
})
