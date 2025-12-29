# Project Configuration

- **Project Name**: RuntheK-KoreaTravel AI Agent
- **Primary Language**: Java 17 (amazon-corretto-17)
- **Framework**: Spring Boot 3.2
- **Architecture**: Monolithic Server
- **Database**: PostgreSQL, Redis
- **Build Tool**: Gradle
- **Testing**: JUnit 5, Mockito

---

## Conventions

### 1. Code Style

- Follow **Google Java Style Guide**
- DTOs strictly separated from Entities
- Use **Builder pattern** for object creation
- Use **Lombok** annotations (`@Getter`, `@Builder`, `@NoArgsConstructor`, `@AllArgsConstructor`)

---

### 2. Package Structure

```
com.runthek.travel
├── domain/                     # Domain-driven modules
│   ├── auth/
│   │   ├── controller/
│   │   ├── service/
│   │   ├── repository/
│   │   ├── entity/
│   │   └── dto/
│   ├── user/
│   ├── trip/
│   ├── destination/
│   ├── event/
│   ├── rating/
│   └── bookmark/
├── global/                     # Cross-cutting concerns
│   ├── config/                 # Configuration classes
│   ├── exception/              # Global exception handling
│   ├── security/               # JWT, Authentication
│   ├── common/                 # Common utilities, Base entities
│   └── response/               # API response wrappers
└── infra/                      # External integrations
    ├── redis/                  # Redis cache configuration
    └── external/               # Future AI server integration
```

---

### 3. Naming Conventions

#### 3.1 Class Naming

| Type | Pattern | Example |
|------|---------|---------|
| Controller | `{Domain}Controller` | `UserController`, `TripController` |
| Service Interface | `{Domain}Service` | `UserService`, `TripService` |
| Service Implementation | `{Domain}ServiceImpl` | `UserServiceImpl` |
| Repository | `{Domain}Repository` | `UserRepository` |
| Entity | Singular noun | `User`, `Trip`, `Destination` |
| Request DTO | `{Action}{Domain}Request` | `CreateTripRequest`, `UpdateUserRequest` |
| Response DTO | `{Domain}Response` | `UserResponse`, `TripDetailResponse` |
| Exception | `{Domain}{Reason}Exception` | `UserNotFoundException`, `TripAccessDeniedException` |

#### 3.2 Method Naming

| Layer | Pattern | Example |
|-------|---------|---------|
| Controller | HTTP verb style | `getUser()`, `createTrip()`, `updateProfile()` |
| Service | Business action | `findUserById()`, `saveTrip()`, `validatePassword()` |
| Repository | Spring Data JPA style | `findByEmail()`, `findAllByUserId()` |

#### 3.3 Variable Naming

| Type | Convention | Example |
|------|------------|---------|
| Local variables | camelCase | `userId`, `tripList` |
| Constants | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT`, `DEFAULT_PAGE_SIZE` |
| Boolean | `is`, `has`, `can` prefix | `isActive`, `hasPermission` |

---

### 4. Exception Handling

#### 4.1 Exception Hierarchy

```
BusinessException (abstract)
├── EntityNotFoundException
│   ├── UserNotFoundException
│   ├── TripNotFoundException
│   └── DestinationNotFoundException
├── AuthenticationException
│   ├── InvalidTokenException
│   ├── TokenExpiredException
│   └── InvalidCredentialsException
├── AuthorizationException
│   ├── AccessDeniedException
│   └── InsufficientPermissionException
└── ValidationException
    ├── InvalidInputException
    └── DuplicateResourceException
```

#### 4.2 Exception Structure

```java
@Getter
public abstract class BusinessException extends RuntimeException {
    private final ErrorCode errorCode;
    private final HttpStatus httpStatus;

    protected BusinessException(ErrorCode errorCode, HttpStatus httpStatus) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
        this.httpStatus = httpStatus;
    }
}
```

#### 4.3 Error Code Enum

```java
@Getter
@RequiredArgsConstructor
public enum ErrorCode {
    // Common
    INVALID_INPUT("C001", "Invalid input data"),
    INTERNAL_SERVER_ERROR("C002", "Internal server error"),

    // Auth
    INVALID_TOKEN("A001", "Invalid token"),
    TOKEN_EXPIRED("A002", "Token has expired"),
    INVALID_CREDENTIALS("A003", "Invalid email or password"),

    // User
    USER_NOT_FOUND("U001", "User not found"),
    DUPLICATE_EMAIL("U002", "Email already exists"),

    // Trip
    TRIP_NOT_FOUND("T001", "Trip not found"),
    TRIP_ACCESS_DENIED("T002", "Access denied to this trip");

    private final String code;
    private final String message;
}
```

#### 4.4 Global Exception Handler

```java
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ErrorResponse> handleBusinessException(BusinessException e) {
        log.warn("Business exception: {}", e.getMessage());
        return ResponseEntity
            .status(e.getHttpStatus())
            .body(ErrorResponse.of(e.getErrorCode()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationException(MethodArgumentNotValidException e) {
        log.warn("Validation exception: {}", e.getMessage());
        return ResponseEntity
            .status(HttpStatus.BAD_REQUEST)
            .body(ErrorResponse.of(ErrorCode.INVALID_INPUT, e.getBindingResult()));
    }
}
```

#### 4.5 Error Response Format

```json
{
    "success": false,
    "error": {
        "code": "U001",
        "message": "User not found",
        "details": []
    },
    "meta": {
        "timestamp": "2024-12-23T10:00:00Z",
        "requestId": "req_abc123"
    }
}
```

---

### 5. API Response Format

#### 5.1 Success Response

```java
@Getter
@Builder
public class ApiResponse<T> {
    private final boolean success;
    private final T data;
    private final Meta meta;

    public static <T> ApiResponse<T> ok(T data) {
        return ApiResponse.<T>builder()
            .success(true)
            .data(data)
            .meta(Meta.now())
            .build();
    }
}
```

#### 5.2 Paginated Response

```java
@Getter
@Builder
public class PageResponse<T> {
    private final boolean success;
    private final List<T> data;
    private final PageInfo pagination;
    private final Meta meta;
}

@Getter
@Builder
public class PageInfo {
    private final int page;
    private final int limit;
    private final long total;
    private final int totalPages;
    private final boolean hasNext;
    private final boolean hasPrev;
}
```

---

### 6. JPA & Database Conventions

#### 6.1 Base Entity

```java
@Getter
@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
public abstract class BaseEntity {

    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
```

#### 6.2 Soft Delete Entity

```java
@Getter
@MappedSuperclass
public abstract class SoftDeleteEntity extends BaseEntity {

    private LocalDateTime deletedAt;

    public void softDelete() {
        this.deletedAt = LocalDateTime.now();
    }

    public boolean isDeleted() {
        return deletedAt != null;
    }
}
```

#### 6.3 Entity Rules

- All entities must extend `BaseEntity` or `SoftDeleteEntity`
- Use `@Column(nullable = false)` for required fields
- Define `@Index` in `@Table` annotation for frequently queried columns
- Avoid bidirectional relationships unless necessary
- Use `FetchType.LAZY` by default, optimize with `@EntityGraph` when needed

---

### 7. AI Service Integration (Future)

> AI features will be developed as a separate service. The following considerations apply:

- **Excluded from BE scope**: AI-based itinerary generation and regeneration
- **DB extensibility**: Schema designed to accommodate AI-generated data
- **Endpoint reservation**: `/api/v1/ai/*` reserved for future AI service proxy
- **Interface preparation**: Define `AiServiceClient` interface for future integration

```java
// Placeholder for future AI service integration
public interface AiServiceClient {
    ItineraryResponse generateItinerary(ItineraryGenerateRequest request);
    ItineraryResponse regenerateItinerary(ItineraryRegenerateRequest request);
}
```

---

### 8. Security Conventions (OWASP Top 10)

> Based on **OWASP Top 10:2021** - Security guidelines for Spring Boot 3.2

#### 8.1 A01: Broken Access Control

```java
// Use method-level security
@PreAuthorize("hasRole('ADMIN')")
public void deleteUser(Long userId) { ... }

@PreAuthorize("#userId == authentication.principal.id")
public TripResponse getTrip(Long userId, Long tripId) { ... }

// Resource ownership validation in Service layer
public Trip findTripByIdAndUserId(Long tripId, Long userId) {
    return tripRepository.findByIdAndUserId(tripId, userId)
        .orElseThrow(() -> new TripAccessDeniedException());
}
```

**Rules:**
- Always validate resource ownership before CRUD operations
- Use `@PreAuthorize` for role-based access control
- Deny by default, explicitly grant permissions
- Log all access control failures

---

#### 8.2 A02: Cryptographic Failures

```java
// Password encoding
@Bean
public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder(12); // Cost factor 12
}

// Token hashing for storage
public String hashToken(String token) {
    return DigestUtils.sha256Hex(token);
}

// Sensitive data in Entity
@Column(name = "password_hash")
private String passwordHash;  // Never store plain text

@Column(name = "refresh_token_hash")
private String refreshTokenHash;  // Store hash, not token
```

**Rules:**
- Use BCrypt (cost 12+) for password hashing
- Store token hashes, not plain tokens
- Use HTTPS only (enforce in Spring Security)
- Never log sensitive data (passwords, tokens, PII)

---

#### 8.3 A03: Injection

```java
// SQL Injection Prevention - Use JPA/Hibernate parameterized queries
@Query("SELECT u FROM User u WHERE u.email = :email")
Optional<User> findByEmail(@Param("email") String email);

// NEVER do this
@Query("SELECT u FROM User u WHERE u.email = '" + email + "'")  // VULNERABLE!

// Input validation with Bean Validation
public record CreateUserRequest(
    @NotBlank @Email @Size(max = 255)
    String email,

    @NotBlank @Size(min = 8, max = 100)
    @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).*$")
    String password,

    @NotBlank @Size(max = 100)
    @Pattern(regexp = "^[a-zA-Z\\s]+$")  // Only letters and spaces
    String name
) {}
```

**Rules:**
- Always use parameterized queries (JPA handles this)
- Validate all input with Bean Validation annotations
- Sanitize user input before processing
- Use allowlist validation where possible

---

#### 8.4 A04: Insecure Design

```java
// Rate limiting for sensitive operations
@RateLimiter(name = "auth", fallbackMethod = "rateLimitFallback")
public AuthResponse login(LoginRequest request) { ... }

// Account lockout after failed attempts
@Transactional
public void recordFailedLogin(String email) {
    User user = userRepository.findByEmail(email).orElse(null);
    if (user != null) {
        user.incrementFailedAttempts();
        if (user.getFailedAttempts() >= MAX_FAILED_ATTEMPTS) {
            user.lockAccount(Duration.ofMinutes(30));
        }
    }
}

// Secure password reset flow
public void initiatePasswordReset(String email) {
    // Always return success (prevent email enumeration)
    userRepository.findByEmail(email).ifPresent(user -> {
        String token = generateSecureToken();
        // Token expires in 1 hour
        passwordResetRepository.save(new PasswordReset(user, hashToken(token),
            LocalDateTime.now().plusHours(1)));
        emailService.sendPasswordResetEmail(email, token);
    });
}
```

**Rules:**
- Implement rate limiting on authentication endpoints
- Account lockout after 5 failed login attempts
- Secure password reset with time-limited tokens
- Prevent user enumeration (consistent responses)

---

#### 8.5 A05: Security Misconfiguration

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
            // Disable unnecessary features
            .csrf(csrf -> csrf.disable())  // Disabled for stateless JWT API
            .formLogin(form -> form.disable())
            .httpBasic(basic -> basic.disable())

            // Security headers
            .headers(headers -> headers
                .contentSecurityPolicy(csp -> csp
                    .policyDirectives("default-src 'self'"))
                .frameOptions(frame -> frame.deny())
                .xssProtection(xss -> xss.disable())  // Modern browsers
                .contentTypeOptions(Customizer.withDefaults())
            )

            // Session management
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))

            // Authorization rules
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/v1/auth/**").permitAll()
                .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated()
            )
            .build();
    }
}
```

**Rules:**
- Disable unused Spring Security features
- Set proper security headers (CSP, X-Frame-Options, etc.)
- Use stateless session for JWT APIs
- Externalize secrets (use environment variables)
- Disable detailed error messages in production

---

#### 8.6 A06: Vulnerable Components

```yaml
# build.gradle - Dependency management
plugins {
    id 'org.owasp.dependencycheck' version '9.0.0'
}

dependencyCheck {
    failBuildOnCVSS = 7  // Fail on HIGH/CRITICAL vulnerabilities
    suppressionFile = 'owasp-suppressions.xml'
}
```

**Rules:**
- Run `./gradlew dependencyCheckAnalyze` in CI/CD pipeline
- Update dependencies monthly
- Use Spring Boot BOM for version management
- Monitor security advisories for used libraries

---

#### 8.7 A07: Authentication Failures

```java
// JWT Configuration
@Configuration
public class JwtConfig {

    @Value("${jwt.secret}")
    private String secret;  // Min 256 bits for HS256

    @Value("${jwt.access-token-expiry}")
    private Duration accessTokenExpiry;  // 15 minutes recommended

    @Value("${jwt.refresh-token-expiry}")
    private Duration refreshTokenExpiry;  // 7 days max
}

// Token validation
public Claims validateToken(String token) {
    try {
        return Jwts.parserBuilder()
            .setSigningKey(getSigningKey())
            .build()
            .parseClaimsJws(token)
            .getBody();
    } catch (ExpiredJwtException e) {
        throw new TokenExpiredException();
    } catch (JwtException e) {
        throw new InvalidTokenException();
    }
}

// Refresh token rotation
@Transactional
public TokenResponse refreshToken(String refreshToken) {
    RefreshToken stored = refreshTokenRepository
        .findByTokenHash(hashToken(refreshToken))
        .orElseThrow(InvalidTokenException::new);

    // Invalidate old token
    refreshTokenRepository.delete(stored);

    // Issue new token pair
    return issueNewTokens(stored.getUser());
}
```

**Rules:**
- Access token: 15 minutes expiry
- Refresh token: 7 days expiry, rotate on use
- Store refresh tokens as hashes in database
- Invalidate all tokens on password change
- Use secure random for token generation

---

#### 8.8 A08: Data Integrity Failures

```java
// Verify external data integrity
public GoogleUserInfo verifyGoogleToken(String idToken) {
    GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
        httpTransport, jsonFactory)
        .setAudience(Collections.singletonList(googleClientId))
        .build();

    GoogleIdToken token = verifier.verify(idToken);
    if (token == null) {
        throw new InvalidGoogleTokenException();
    }
    return extractUserInfo(token.getPayload());
}

// Audit logging for critical operations
@Aspect
@Component
public class AuditAspect {

    @AfterReturning("@annotation(Audited)")
    public void logAudit(JoinPoint joinPoint) {
        String action = joinPoint.getSignature().getName();
        String userId = SecurityContextHolder.getContext()
            .getAuthentication().getName();
        auditLogRepository.save(new AuditLog(action, userId, LocalDateTime.now()));
    }
}
```

**Rules:**
- Verify signatures of external tokens (Google, etc.)
- Audit log all admin operations
- Use database transactions for data consistency
- Validate data integrity after deserialization

---

#### 8.9 A09: Security Logging and Monitoring

```java
// Security event logging
@Slf4j
@Component
public class SecurityEventLogger {

    public void logAuthSuccess(String email, String ip) {
        log.info("AUTH_SUCCESS | email={} | ip={}", maskEmail(email), ip);
    }

    public void logAuthFailure(String email, String ip, String reason) {
        log.warn("AUTH_FAILURE | email={} | ip={} | reason={}",
            maskEmail(email), ip, reason);
    }

    public void logAccessDenied(String userId, String resource) {
        log.warn("ACCESS_DENIED | userId={} | resource={}", userId, resource);
    }

    public void logSuspiciousActivity(String userId, String activity) {
        log.error("SUSPICIOUS_ACTIVITY | userId={} | activity={}", userId, activity);
    }

    private String maskEmail(String email) {
        // john@email.com -> j***@email.com
        int atIndex = email.indexOf('@');
        return email.charAt(0) + "***" + email.substring(atIndex);
    }
}
```

**Log Events:**
| Event | Level | Action |
|-------|-------|--------|
| Login success | INFO | Record for analytics |
| Login failure | WARN | Monitor for brute force |
| Access denied | WARN | Review permissions |
| Multiple failures | ERROR | Trigger alert |
| Admin actions | INFO | Audit trail |

---

#### 8.10 A10: Server-Side Request Forgery (SSRF)

```java
// URL validation for external resources
public boolean isAllowedUrl(String url) {
    try {
        URL parsedUrl = new URL(url);
        String host = parsedUrl.getHost();

        // Allowlist approach
        return ALLOWED_DOMAINS.stream()
            .anyMatch(domain -> host.endsWith(domain));
    } catch (MalformedURLException e) {
        return false;
    }
}

// Image URL validation
private static final Set<String> ALLOWED_IMAGE_DOMAINS = Set.of(
    "images.unsplash.com",
    "storage.googleapis.com",
    "runthek.com"
);

public void validateImageUrl(String imageUrl) {
    if (!isAllowedUrl(imageUrl)) {
        throw new InvalidImageUrlException();
    }
}
```

**Rules:**
- Allowlist external domains for image/resource URLs
- Block private IP ranges (127.0.0.1, 10.x.x.x, 192.168.x.x)
- Validate and sanitize all URLs from user input
- Use timeouts for external HTTP calls

---

#### 8.11 Security Checklist

| Category | Check | Implementation |
|----------|-------|----------------|
| Authentication | Password hashing | BCrypt (cost 12) |
| Authentication | Token storage | SHA-256 hash in DB |
| Authentication | Token expiry | Access: 15min, Refresh: 7d |
| Authorization | Resource ownership | Service layer validation |
| Authorization | Role-based access | `@PreAuthorize` |
| Input | Validation | Bean Validation + custom |
| Input | SQL Injection | JPA parameterized queries |
| Headers | Security headers | CSP, X-Frame-Options |
| Logging | Auth events | Structured logging |
| Logging | Sensitive data | Masked in logs |
| Dependencies | Vulnerability scan | OWASP Dependency Check |

---

## Quick Reference

| Category | Rule |
|----------|------|
| Code Style | Google Java Style Guide |
| Package | Domain-driven modular structure |
| Controller | `{Domain}Controller` |
| Service | `{Domain}Service` / `{Domain}ServiceImpl` |
| Repository | `{Domain}Repository` |
| Request DTO | `{Action}{Domain}Request` |
| Response DTO | `{Domain}Response` |
| Exception | Extend `BusinessException`, use `ErrorCode` enum |
| Entity | Extend `BaseEntity`, use Lombok |
| Response | Wrap with `ApiResponse<T>` |
