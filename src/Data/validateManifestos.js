
import { manifestos } from './manifestos.js'

export function validateManifestos() {
  const errors = []
  const allowedStatuses = ['verified', 'needs-review', 'excluded']

  manifestos.forEach((manifesto, index) => {
    const label = manifesto.id || `Record ${index + 1}`

    if (!manifesto.id) {
      errors.push(`${label}: Missing manifesto ID`)
    }

    if (!manifesto.documentUrl) {
      errors.push(`${label}: Missing document URL`)
    }

    if (!allowedStatuses.includes(manifesto.verificationStatus)) {
      errors.push(`${label}: Invalid verification status`)
    }

    if (!manifesto.documentType) {
      errors.push(`${label}: Missing document type`)
    }

    if (!manifesto.hostType) {
      errors.push(`${label}: Missing host type`)
    }

    if (!Object.hasOwn(manifesto, 'lastVerified')) {
      errors.push(`${label}: Missing lastVerified field`)
    }
  })

  return {
    valid: errors.length === 0,
    totalManifestos: manifestos.length,
    errors
  }
}
