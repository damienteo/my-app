import { getYearsAndMonths } from '../../../utils/utils'

test('should fail', () => {
  expect(getYearsAndMonths(0)).toBe('0 months')
})
