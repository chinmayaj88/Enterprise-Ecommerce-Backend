# ADR-0001: Clean Architecture

## Status
Accepted

## Context
We need to structure our microservices in a way that:
- Is maintainable and testable
- Allows easy replacement of external dependencies
- Keeps business logic independent of frameworks
- Supports team collaboration

## Decision
We will adopt **Clean Architecture** (also known as Hexagonal Architecture or Ports & Adapters) for all services.

## Consequences

### Positive
- ✅ Business logic is framework-agnostic
- ✅ Easy to test (domain layer has no dependencies)
- ✅ Clear separation of concerns
- ✅ Easy to swap implementations (e.g., change database)
- ✅ Better code organization
- ✅ Scalable team structure

### Negative
- ⚠️ More files and directories (but better organized)
- ⚠️ Slightly more boilerplate
- ⚠️ Learning curve for new team members

## Implementation

The architecture is organized into layers:

1. **Domain**: Pure business logic
2. **Application**: Use cases and orchestration
3. **Infrastructure**: External world (DB, messaging, etc.)
4. **Interfaces**: Entry points (HTTP, events, scheduler)
5. **Shared**: Common utilities

## Alternatives Considered

1. **MVC**: Too tightly coupled, hard to test
2. **Layered Architecture**: Still couples to frameworks
3. **Onion Architecture**: Similar to Clean Architecture, but Clean Architecture is more widely understood

## References

- [Clean Architecture by Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture/)

