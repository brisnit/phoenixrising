import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PendingTag } from '@/components/ui/PendingTag'
import { PlaceholderNote } from '@/components/ui/PlaceholderNote'

describe('PendingTag', () => {
  it('labels an assertion as unverified in visible text', () => {
    render(<PendingTag />)
    /* Visible text, not a title attribute or aria-label alone — a sighted
       visitor must be able to tell an unverified claim from an approved one. */
    expect(screen.getByText('Unverified')).toBeVisible()
  })
})

describe('PlaceholderNote', () => {
  it('renders its reason as visible text', () => {
    render(<PlaceholderNote>Awaiting verified figures</PlaceholderNote>)
    expect(screen.getByText('Awaiting verified figures')).toBeVisible()
  })
})
