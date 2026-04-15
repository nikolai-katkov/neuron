# ARASAAC API Reference

Public API for the ARASAAC pictogram library (arasaac.org).
Base URL: `https://api.arasaac.org/v1`

## Search Pictograms

```
GET /pictograms/{locale}/search/{searchText}
```

**Parameters:**

| Name         | In   | Description                           |
| ------------ | ---- | ------------------------------------- |
| `locale`     | path | Language code: `en`, `es`, `ru`, etc. |
| `searchText` | path | Keyword to search (URL-encoded)       |

**Response:** JSON array of pictogram objects:

```json
[
  {
    "_id": 2462,
    "keywords": [
      {
        "type": 2,
        "meaning": "f. Fruit round, thin skin...",
        "keyword": "apple",
        "plural": "apples",
        "hasLocution": true
      }
    ],
    "categories": ["fruit", "core vocabulary-feeding"],
    "tags": ["feeding", "food", "plant-based food", "fruit", "core vocabulary"],
    "synsets": ["07755101-n"],
    "skin": false,
    "hair": false,
    "aac": true,
    "aacColor": true,
    "sex": false,
    "violence": false,
    "schematic": false,
    "downloads": 0,
    "created": "2007-12-14T12:34:03.000Z",
    "lastUpdated": "2021-02-04T19:39:48.169Z"
  }
]
```

**Key fields:**

- `_id` — unique pictogram ID (used for image downloads)
- `keywords[].keyword` — matched word in the requested locale
- `skin` — `true` if the pictogram supports skin color customization
- `hair` — `true` if the pictogram supports hair color customization
- `aac` — `true` if designed for AAC use

## Download Pictogram Image

```
GET /pictograms/{id}
```

Returns PNG image directly (binary).

**Query Parameters:**

| Parameter            | Values                                         | Default        | Effect                                                    |
| -------------------- | ---------------------------------------------- | -------------- | --------------------------------------------------------- |
| `color`              | `true`, `false`                                | `true`         | Color or B&W version                                      |
| `resolution`         | `500`, `2500`                                  | `500`          | Image size in px. Note: `300` returns 400 error           |
| `skin`               | `white`, `black`, `assian`, `mulatto`, `aztec` | (default skin) | Skin color. Only works when `skin: true` in search result |
| `hair`               | `brown`, `blonde`, `red`, `black`              | (default hair) | Hair color. Only works when `hair: true` in search result |
| `action`             | `past`, `future`                               | (none)         | Adds tense marker overlay to the image                    |
| `plural`             | `true`                                         | (none)         | Adds plural marker to the image                           |
| `backgroundColor`    | `true`                                         | (none)         | Adds solid background (removes transparency)              |
| `identifier`         | string                                         | (none)         | Adds text label overlay                                   |
| `identifierPosition` | `left`, etc.                                   | (none)         | Position of identifier label                              |
| `url`                | `true`                                         | (none)         | Returns JSON `{"image": "https://..."}` instead of PNG    |
| `download`           | `true`                                         | (none)         | Sets Content-Disposition header for download              |

**Examples:**

```bash
# Default 500px color image
curl -o apple.png "https://api.arasaac.org/v1/pictograms/2462"

# High-res 2500px
curl -o apple_hd.png "https://api.arasaac.org/v1/pictograms/2462?resolution=2500"

# B&W version
curl -o apple_bw.png "https://api.arasaac.org/v1/pictograms/2462?color=false"

# Doctor with white skin
curl -o doctor.png "https://api.arasaac.org/v1/pictograms/6561?skin=white"

# Girl with brown hair and white skin
curl -o girl.png "https://api.arasaac.org/v1/pictograms/27509?skin=white&hair=brown"

# Get URL instead of image
curl "https://api.arasaac.org/v1/pictograms/2462?url=true"
# → {"image": "https://static.arasaac.org/pictograms/2462/2462_500.png"}
```

## Static CDN (no customization)

Direct access without API parameters:

```
https://static.arasaac.org/pictograms/{id}/{id}_500.png          (color, 500px)
https://static.arasaac.org/pictograms/{id}/{id}_nocolor_500.png  (B&W, 500px)
```

## Notes

- **Rate limiting:** No documented rate limits, but be respectful (~200ms between requests).
- **Skin values:** Note the typo in the API — it's `assian`, not `asian`. Using `asian` returns a 400 error.
- **Resolution:** Only `500` and `2500` are supported. Other values (e.g., `300`) return 400.
- **Coverage:** ~87% hit rate for common English nouns. Multi-word phrases often fail — try splitting or using individual words as fallback.
- **License:** CC BY-NC-SA 4.0. Attribution required: "Pictographic symbols by ARASAAC (arasaac.org)"
