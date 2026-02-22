# Test Mocks

Place shared mock utilities here as features are built.

## Patterns

- **API hooks**: Use MSW (`msw/node`) to intercept network requests in tests
- **Manual mocks**: Co-locate `__mocks__/` directories next to modules when MSW is overkill
- **Test data factories**: Add factory functions here for generating test fixtures
