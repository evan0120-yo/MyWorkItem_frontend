import { buildMockAuthHeaders } from '../MockAuthContext'

describe('buildMockAuthHeaders', () => {
  it('buildMockAuthHeaders_WhenCurrentUserExists_ReturnsExpectedHeaders', () => {
    expect(
      buildMockAuthHeaders({
        userId: 'user-a',
        userName: 'User A',
        role: 'User',
      }),
    ).toEqual({
      'X-Mock-User-Id': 'user-a',
      'X-Mock-User-Name': 'User A',
      'X-Mock-Role': 'User',
    })
  })
})
