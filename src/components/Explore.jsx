
import { useState } from 'react'
import { manifestos } from '../Data/manifestos.js'
import { locations } from '../Data/location.js'
import { parties } from '../Data/parties.js'
import { electionParticipants } from '../Data/electionParticipants.js'

function Explore() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedYear, setSelectedYear] = useState('')
  const [selectedElection, setSelectedElection] = useState('All')
  const [selectedState, setSelectedState] = useState('All')
  const [selectedSourceType, setSelectedSourceType] = useState('All')
  const [sortOrder, setSortOrder] = useState('newest')

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedYear('')
    setSelectedElection('All')
    setSelectedState('All')
    setSelectedSourceType('All')
    setSortOrder('newest')
  }

  const filteredManifestos = manifestos.filter((item) => {
    const searchableText = [
      item.partyName,
      item.state,
      item.electionType,
      item.electionYear
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    const matchesParty = searchableText.includes(
      searchTerm.trim().toLowerCase()
    )

    const matchesYear =
      selectedYear === '' ||
      String(item.electionYear) === selectedYear

    const matchesElection =
      selectedElection === 'All' ||
      item.electionType === selectedElection

    const matchesState =
      selectedState === 'All' ||
      item.state === selectedState

    const matchesSourceType =
      selectedSourceType === 'All' ||
      item.sourceType === selectedSourceType

    return (
      matchesParty &&
      matchesYear &&
      matchesElection &&
      matchesState &&
      matchesSourceType
    )
  })
const sortedManifestos = [...filteredManifestos].sort((a, b) => {
  if (sortOrder === 'newest') {
    return Number(b.electionYear) - Number(a.electionYear)
  }

  return Number(a.electionYear) - Number(b.electionYear)
})
  const filteredParticipants = electionParticipants.filter((item) => {
    const matchesElection =
      selectedElection === 'All' ||
      item.electionType === selectedElection

    const matchesState =
      selectedState === 'All' ||
      item.state === selectedState

    const matchesYear =
      selectedYear === '' ||
      String(item.electionYear) === selectedYear

    return matchesElection && matchesState && matchesYear
  })

  const participatingParties = filteredParticipants
    .map((participant) =>
      parties.find((party) => party.id === participant.partyId)
    )
    .filter(Boolean)

  const availableYears = [
    ...new Set([
      ...manifestos
        .filter((item) =>
          (selectedElection === 'All' ||
            item.electionType === selectedElection) &&
          (selectedElection !== 'State Assembly' ||
            selectedState === 'All' ||
            item.state === selectedState)
        )
        .map((item) => item.electionYear),

      ...electionParticipants
        .filter((item) =>
          (selectedElection === 'All' ||
            item.electionType === selectedElection) &&
          (selectedElection !== 'State Assembly' ||
            selectedState === 'All' ||
            item.state === selectedState)
        )
        .map((item) => item.electionYear)
    ])
  ].sort((a, b) => b - a)

  const hasSelection =
    searchTerm.trim() !== '' ||
    selectedYear !== '' ||
    selectedElection !== 'All' ||
    selectedSourceType !== 'All' ||
    selectedState !== 'All'

  return (
    <section className="explore" id="explore">

      <p className="explore-label">EXPLORE THE DOCUMENTS</p>

      <h2>Explore Political Manifestos</h2>

      <p className="explore-description">
        Discover what different political parties are proposing
        across elections and policy areas.
      </p>

      <div className="explore-controls">

        <input
          type="text"
          placeholder="Search by party, state or election..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <select
          value={selectedElection}
          onChange={(e) => {
            setSelectedElection(e.target.value)
            setSelectedState('All')
            setSelectedYear('')
          }}
        >
          <option value="All">All Elections</option>
          <option value="Lok Sabha">Lok Sabha</option>
          <option value="State Assembly">State Assembly</option>
        </select>

        {selectedElection === 'State Assembly' && (
          <select
            value={selectedState}
            onChange={(e) => {
              setSelectedState(e.target.value)
              setSelectedYear('')
            }}
          >
            <option value="All">All States & UTs</option>

            {locations.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>
        )}

        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
        >
          <option value="">All Years</option>

          {availableYears.map((year) => (
            <option key={year} value={String(year)}>
              {year}
            </option>
          ))}
        </select>
        <select
  value={sortOrder}
  onChange={(e) => setSortOrder(e.target.value)}
>
  <option value="newest">Newest First</option>
  <option value="oldest">Oldest First</option>
</select>

        <select
          value={selectedSourceType}
          onChange={(e) => setSelectedSourceType(e.target.value)}
        >
          <option value="All">All Source Types</option>
          <option value="Official PDF">Official PDF</option>
          <option value="Official Page">Official Page</option>
          <option value="Government Archive">Government Archive</option>
          <option value="Archived Official PDF">Archived Official PDF</option>
          <option value="Third-Party Archive">Third-Party Archive</option>
          <option value="Third-Party Summary">Third-Party Summary</option>
          <option value="News Report">News Report</option>
          <option value="Official Website – Manifesto Unverified">
            Official Website – Manifesto Unverified
          </option>
        </select>

        <button
          className="clear-filters-btn"
          onClick={clearFilters}
        >
          Clear All Filters
        </button>

      </div>

      {selectedElection === 'State Assembly' &&
        selectedState !== 'All' && (
          <div className="participating-parties">

            <h3>Parties Participating in {selectedState}</h3>

            {participatingParties.length > 0 ? (
              <div className="party-grid">

                {participatingParties.map((party) => (
                  <div className="party-card" key={party.id}>

                    {party.symbolImage && (
                      <img
                        src={party.symbolImage}
                        alt={`${party.name} symbol`}
                        className="party-symbol-image"
                      />
                    )}

                    <h4>{party.name}</h4>
                    <p>{party.abbreviation}</p>
                    <p>{party.recognitionStatus}</p>

                    {party.officialSymbol && (
                      <p>Symbol: {party.officialSymbol}</p>
                    )}

                    {party.officialWebsite && (
                      <a
                        href={party.officialWebsite}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Official Website ↗
                      </a>
                    )}

                  </div>
                ))}

              </div>
            ) : (
              <p>No participation records added for this election yet.</p>
            )}

          </div>
        )}

      <div className="manifesto-count">
  {hasSelection
    ? `${filteredManifestos.length} matching manifestos found`
    : `${manifestos.length} manifestos available`}
</div>

      <div className="manifesto-results">

        {!hasSelection ? (
          <p className="explore-placeholder">
            Search for a political party or select filters to explore
            its manifestos.
          </p>
        ) : filteredManifestos.length > 0 ? (

         sortedManifestos.map((item) => (
            <div className="manifesto-card" key={item.id}>

              <h3>{item.partyName}</h3>

              <p>
                {item.electionType} · {item.electionYear}
              </p>

              <p>{item.state || 'National'}</p>

              <div className="manifesto-badges">
  <span className="source-badge">
    {item.sourceType || 'Source not classified'}
  </span>

  <span className={`document-badge ${item.documentUrl ? 'available' : 'unavailable'}`}>
    {item.documentUrl ? 'Document Available' : 'Document Unavailable'}
  </span>
</div>

              {item.documentUrl ? (
                <a
                  href={item.documentUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="manifesto-link"
                >
                  Read Manifesto ↗
                </a>
              ) : (
                <p>Manifesto document link unavailable.</p>
              )}

            </div>
          ))

        ) : (
          <p>No matching manifestos found.</p>
        )}

      </div>

    </section>
  )
}

export default Explore
