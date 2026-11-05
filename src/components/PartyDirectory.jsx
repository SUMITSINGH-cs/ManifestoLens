import { useState } from 'react'
import { parties } from '../Data/parties.js'
import { manifestos } from '../Data/manifestos.js'
function PartyDirectory() {
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('All')
    const [currentPage, setCurrentPage] = useState(1)
    const [expandedParty, setExpandedParty] = useState(null)

const partiesPerPage = 12
   const clearFilters = () => {
  setSearchTerm('')
  setSelectedCategory('All')
  setCurrentPage(1)
  setExpandedParty(null)
}
   const filteredParties = parties.filter((party) => {
  const matchesSearch = `${party.name} ${party.abbreviation}`
    .toLowerCase()
    .includes(searchTerm.toLowerCase())

  const matchesCategory =
    selectedCategory === 'All' ||
    party.recognitionStatus === selectedCategory

  return matchesSearch && matchesCategory
})
 const totalPages = Math.ceil(
  filteredParties.length / partiesPerPage
)

const startIndex = (currentPage - 1) * partiesPerPage

const visibleParties = filteredParties.slice(
  startIndex,
  startIndex + partiesPerPage
)
  return (
    <section className="party-directory">
        

      <p className="party-label">INDIA'S POLITICAL LANDSCAPE</p>

      <h2>Explore Political Parties</h2>

      <p className="party-description">
        Discover political parties, their backgrounds,
        official information and election participation.
      </p>
      <div className="party-controls">
  <input
    type="text"
    placeholder="Search political parties..."
    value={searchTerm}
    onChange={(e) => {
      setSearchTerm(e.target.value)
      setCurrentPage(1)
      setExpandedParty(null)
    }}
  />

  <select
    value={selectedCategory}
    onChange={(e) => {
      setSelectedCategory(e.target.value)
      setCurrentPage(1)
      setExpandedParty(null)
    }}
  >
    <option value="All">All Categories</option>
    <option value="National Party">National Parties</option>
    <option value="State Party">State Parties</option>
    <option value="Registered Unrecognised Party">
      Registered Unrecognised Parties
    </option>
  </select>

  <button className="clear-filters-btn" onClick={clearFilters}>
    Clear Filters
  </button>
</div>
      <div className="party-resources">
  <a
    href="https://www.eci.gov.in/list-of-political-parties/"
    target="_blank"
    rel="noreferrer"
  >
    View All Registered Parties ↗
  </a>

  <a
    href="https://sansad.in/ls/library/manifestos"
    target="_blank"
    rel="noreferrer"
  >
    Explore Official Manifestos ↗
  </a>
</div>

      <p className="party-count">
  Showing {filteredParties.length > 0 ? startIndex + 1 : 0}–
  {Math.min(startIndex + partiesPerPage, filteredParties.length)}
  {' '}of {filteredParties.length} parties
</p>
      
  {filteredParties.length > 0 ? (
  <>
  <div className="party-grid">
    {visibleParties.map((party) => {
      const partyManifestos = manifestos.filter(
        (item) => item.partyId === party.id
      )

      return (
        <div className="party-card" key={party.id}>
          <div className="party-symbol-wrapper">
  <div className="party-symbol-fallback">
    {party.abbreviation || party.name.substring(0, 3).toUpperCase()}
  </div>

  {party.symbolImage && (
    <img
      src={party.symbolImage}
      alt={`${party.name} symbol`}
      className="party-symbol-image"
      onLoad={(e) => {
        e.currentTarget.parentElement.classList.add('has-image');
      }}
      onError={(e) => {
        e.currentTarget.style.display = 'none';
        e.currentTarget.parentElement.classList.remove('has-image');
      }}
    />
  )}
</div>
          <h3>{party.name}</h3>
          <p className="party-abbreviation">{party.abbreviation}</p>
          <button
  className="party-details-btn"
  onClick={() =>
    setExpandedParty(
      expandedParty === party.id ? null : party.id
    )
  }
>
  {expandedParty === party.id ? 'Hide Details ↑' : 'View Details ↓'}
</button>
{expandedParty === party.id && (
  <div className="party-expanded-details">

    <h4>Party Information</h4>

    <p>
      <strong>Recognition:</strong> {party.recognitionStatus}
    </p>

    {party.officialSymbol && (
      <p>
        <strong>Election Symbol:</strong> {party.officialSymbol}
      </p>
    )}

    <h4>Available Manifestos</h4>

    {partyManifestos.length > 0 ? (
      <div className="expanded-manifesto-list">

        {partyManifestos.map((item) => (
          <div className="expanded-manifesto-item" key={item.id}>

            <p>
              {item.electionType} · {item.electionYear}
              {item.state && ` · ${item.state}`}
            </p>

            {item.documentUrl ? (
              <a
                href={item.documentUrl}
                target="_blank"
                rel="noreferrer"
              >
                Read Document ↗
              </a>
            ) : (
              <span>Document link unavailable</span>
            )}

          </div>
        ))}

      </div>
    ) : (
      <p>No manifesto records available.</p>
    )}

  </div>
)}
          {party.officialSymbol && (
            <p className="party-symbol">Election Symbol: {party.officialSymbol}</p>
          )}
         <span className={`party-category-badge ${
  party.recognitionStatus === 'National Party'
    ? 'national'
    : party.recognitionStatus === 'State Party'
      ? 'state'
      : 'registered'
}`}>
  {party.recognitionStatus}
</span>
          
          
          {partyManifestos.length > 0 && (
  <a
    href="#explore"
    className="party-manifesto-summary"
  >
    {partyManifestos.length} manifestos available →
  </a>
)}
          {party.officialWebsite ? (
            <a
              href={party.officialWebsite}
              target="_blank"
              rel="noreferrer"
              className="party-website"
            >
              Visit Official Website ↗
            </a>
          ) : (
            <p className="party-website-missing">Official website not added yet</p>
          )}
              </div>
  )
})}
  </div>
  {totalPages > 1 && (
  <div className="pagination">

    <button
  onClick={() => {
    setCurrentPage(currentPage - 1)
    setExpandedParty(null)
  }}
  disabled={currentPage === 1}
>
  Previous
</button>

    <span>
      Page {currentPage} of {totalPages}
    </span>

    <button
  onClick={() => {
    setCurrentPage(currentPage + 1)
    setExpandedParty(null)
  }}
  disabled={currentPage === totalPages}
>
  Next
</button>

  </div>
  )}
  </>
) : (
  <p>
    {parties.length === 0
      ? 'Verified party information will appear here soon.'
      : 'No matching parties found.'}
  </p>
)}
    </section>
  )
}

  


export default PartyDirectory