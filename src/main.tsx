import './styles/tokens.css'
import './styles/themes/warm.css'
import './styles/themes/soft.css'
import './styles/themes/editorial.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { App } from './App'

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- root element guaranteed by index.html
createRoot(document.querySelector('#root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
