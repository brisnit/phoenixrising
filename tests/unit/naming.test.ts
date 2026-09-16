import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { company, seo, contact } from '@/data/site'

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) walk(full, out)
    else if (/\.(ts|tsx|css|md)$/.test(entry)) out.push(full)
  }
  return out
}

describe('company name', () => {
  it('is spelled "Phoenix Rising" in the data layer', () => {
    expect(company.name).toBe('Phoenix Rising')
    expect(company.wordmark).toEqual(['PHOENIX', 'RISING'])
    expect(company.legalName).toBe('Phoenix Rising Trading Company, LTD.')
  })

  it('is spelled correctly in metadata and contact details', () => {
    expect(seo.defaultTitle).toContain('Phoenix Rising')
    expect(seo.titleTemplate).toContain('Phoenix Rising')
    expect(seo.url).not.toMatch(/rizing/i)
    expect(contact.email).not.toMatch(/rizing/i)
  })

  it('does not appear as "Rizing" anywhere in the source tree', () => {
    const offenders = walk('src')
      .filter((file) => /rizing/i.test(readFileSync(file, 'utf8')))
      .map((file) => file.replace(/\\/g, '/'))

    expect(offenders, 'files still containing the Round 1 misspelling').toEqual([])
  })
})
