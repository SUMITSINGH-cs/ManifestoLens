
import { useState } from 'react'
import { promises } from '../Data/promises.js'
import { manifestos } from '../Data/manifestos.js'

function PromiseComparison() {
  const availableManifestos = manifestos.filter(manifesto =>
    promises.some(promise => promise.manifestoId === manifesto.id)
  )

  const [manifestoA, setManifestoA] = useState('bjp-lok-sabha-2024')
  const [manifestoB, setManifestoB] = useState('inc-lok-sabha-2024')
  const [selectedCategory, setSelectedCategory] = useState('All')

  const categories = [
    'All',
    ...new Set(promises.map(promise => promise.category))
  ]

  const getPromises = (manifestoId) =>
    promises.filter(promise =>
      promise.manifestoId === manifestoId &&
      (selectedCategory === 'All' ||
        promise.category === selectedCategory)
    )

  const getManifestoName = (id) =>
    manifestos.find(item => item.id === id)?.partyName || 'Unknown Party'
const getManifestoUrl = (id) =>
  manifestos.find(item => item.id === id)?.documentUrl
  return (
    <section className="promise-comparison" id="promise-comparison">
      <div className="promise-comparison-heading">
        <p className="section-label">BEYOND TOPIC TAGS</p>
        <h2>Compare Actual Promises</h2>
        <p>
          Explore commitments directly extracted from political manifestos.
          Check their wording and original sources.
        </p>
      </div>

      <div className="promise-controls">
        <div>
          <label>Manifesto A</label>
          <select
            value={manifestoA}
            onChange={e => setManifestoA(e.target.value)}
          >
            {availableManifestos.map(item => (
              <option key={item.id} value={item.id}>
                {item.partyName} - {item.electionYear}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Manifesto B</label>
          <select
            value={manifestoB}
            onChange={e => setManifestoB(e.target.value)}
          >
            {availableManifestos.map(item => (
              <option key={item.id} value={item.id}>
                {item.partyName} - {item.electionYear}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Category</label>
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="promise-comparison-grid">
        <div className="promise-party-column">
          <h3>{getManifestoName(manifestoA)}</h3>
          <p className="promise-result-count">
            {getPromises(manifestoA).length} promises found
          </p>

          {getPromises(manifestoA).map(promise => (
            <article className="promise-card" key={promise.id}>
              <span className="promise-category">
                {promise.category}
              </span>
              <h4>{promise.title}</h4>
              <p>{promise.description}</p>
              <blockquote>{promise.originalText}</blockquote>
              <span className="promise-source">
                Source: Page {promise.sourcePage}
              </span>
              <a
  className="promise-source-link"
  href={`${getManifestoUrl(promise.manifestoId)}#page=${promise.sourcePage}`}
  target="_blank"
  rel="noreferrer"
>
  View Original Manifesto ↗
</a>
            </article>
          ))}

          {getPromises(manifestoA).length === 0 && (
            <p>No recorded promises in this category yet.</p>
          )}
        </div>

        <div className="promise-party-column">
          <h3>{getManifestoName(manifestoB)}</h3>
          <p className="promise-result-count">
            {getPromises(manifestoB).length} promises found
          </p>

          {getPromises(manifestoB).map(promise => (
            <article className="promise-card" key={promise.id}>
              <span className="promise-category">
                {promise.category}
              </span>
              <h4>{promise.title}</h4>
              <p>{promise.description}</p>
              <blockquote>{promise.originalText}</blockquote>
              <span className="promise-source">
                Source: Page {promise.sourcePage}
              </span>
              <a
  className="promise-source-link"
  href={`${getManifestoUrl(promise.manifestoId)}#page=${promise.sourcePage}`}
  target="_blank"
  rel="noreferrer"
>
  View Original Manifesto ↗
</a>
            </article>
          ))}

          {getPromises(manifestoB).length === 0 && (
            <p>No recorded promises in this category yet.</p>
          )}
        </div>
      </div>

      <p className="promise-disclaimer">
        This comparison displays recorded manifesto commitments side by side.
        Similarity and fulfilment have not yet been independently assessed.
      </p>
    </section>
  )
}

export default PromiseComparison
