1. Verify documentation and justification of all the application's trust boundaries, components, and significant data flows.
2. Verify the application does not use unsupported, insecure, or deprecated client-side technologies such as NSAPI plugins, Flash, Shockwave, ActiveX, Silverlight, NACL, or client-side Java applets.
3. Verify that trusted enforcement points, such as access control gateways, servers, and serverless functions, enforce access controls. Never enforce access controls on the client.
4. Verify that all sensitive data is identified and classified into protection levels.
5. Verify that all protection levels have an associated set of protection requirements, such as encryption requirements, integrity requirements, retention, privacy and other confidentiality requirements, and that these are applied in the architecture.
6. Verify that the application employs integrity protections, such as code signing or subresource integrity. The application must not load or execute code from untrusted sources, such as loading includes, modules, plugins, code, or libraries from untrusted sources or the Internet.
7. Verify that the application has protection from subdomain takeovers if the application relies upon DNS entries or DNS subdomains, such as expired domain names, out of date DNS pointers or CNAMEs, expired projects at public source code repos, or transient cloud APIs, serverless functions, or storage buckets (*autogen-bucket-id*.cloud.example.com) or similar. Protections can include ensuring that DNS names used by applications are regularly checked for expiry or change.
8. Verify that the application has anti-automation controls to protect against excessive calls such as mass data exfiltration, business logic requests, file uploads or denial of service attacks.
9. Verify that files obtained from untrusted sources are stored outside the web root, with limited permissions.
10. Verify that files obtained from untrusted sources are scanned by antivirus scanners to prevent upload and serving of known malicious content.
11. Verify API URLs do not expose sensitive information, such as the API key, session tokens etc.
12. Verify that authorization decisions are made at both the URI, enforced by programmatic or declarative security at the controller or router, and at the resource level, enforced by model-based permissions.
13. Verify that enabled RESTful HTTP methods are a valid choice for the user or action, such as preventing normal users using DELETE or PUT on protected API or resources.
14. Verify that the application build and deployment processes are performed in a secure and repeatable way, such as CI / CD automation, automated configuration management, and automated deployment scripts. 
15. Verify that the application, configuration, and all dependencies can be re-deployed using automated deployment scripts, built from a documented and tested runbook in a reasonable time, or restored from backups in a timely fashion.
16. Verify that authorized administrators can verify the integrity of all security-relevant configurations to detect tampering.
17. Verify that web or application server and application framework debug modes are disabled in production to eliminate debug features, developer consoles, and unintended security disclosures.
18. Verify that the supplied Origin header is not used for authentication or access control decisions, as the Origin header can easily be changed by an attacker.
19. Verify that cookie-based session tokens utilize the 'SameSite' attribute to limit exposure to cross-site request forgery attacks. ([C6](https://owasp.org/www-project-proactive-controls/#div-numbering))
20. Verify that the application protects against LDAP injection vulnerabilities, or that specific security controls to prevent LDAP injection have been implemented. ([C4](https://owasp.org/www-project-proactive-controls/#div-numbering))
21. Verify that the application protects against Local File Inclusion (LFI) or Remote File Inclusion (RFI) attacks.
22. Verify that regulated private data is stored encrypted while at rest, such as Personally Identifiable Information (PII), sensitive personal information, or data assessed likely to be subject to EU's GDPR.
23. Verify that all cryptographic operations are constant-time, with no 'short-circuit' operations in comparisons, calculations, or returns, to avoid leaking information.

## Korean
1. 애플리케이션의 모든 신뢰 경계, 구성 요소 및 중요한 데이터 흐름에 대한 문서화 및 정당성을 확인합니다.
2. 애플리케이션이 지원되지 않거나 안전하지 않거나 더 이상 사용되지 않는 클라이언트 측 기술(예: NSAPI 플러그인, 플래시, 쇼크웨이브, 액티브엑스, 실버라이트, NACL 또는 클라이언트 측 자바 애플릿 등)을 사용하지 않는지 확인합니다.
3. 액세스 제어 게이트웨이, 서버, 서버리스 기능 등 신뢰할 수 있는 시행 지점에서 액세스 제어를 시행하는지 확인합니다. 클라이언트에는 접근 제어를 적용하지 마세요.
4. 모든 민감한 데이터가 식별되고 보호 수준으로 분류되었는지 확인합니다.
5. 모든 보호 수준에 암호화 요구 사항, 무결성 요구 사항, 보존, 개인정보 보호 및 기타 기밀성 요구 사항과 같은 관련 보호 요구 사항 집합이 있는지 확인하고 아키텍처에 이러한 요구 사항이 적용되었는지 확인합니다.
6. 애플리케이션이 코드 서명 또는 하위 리소스 무결성과 같은 무결성 보호 기능을 사용하는지 확인합니다. 애플리케이션은 신뢰할 수 없는 소스나 인터넷에서 인클루드, 모듈, 플러그인, 코드 또는 라이브러리를 로드하는 등 신뢰할 수 없는 소스에서 코드를 로드하거나 실행해서는 안 됩니다.
7. 애플리케이션이 만료된 도메인 이름, 오래된 DNS 포인터 또는 CNAME, 공개 소스 코드 리포지토리의 만료된 프로젝트, 일시적인 클라우드 API, 서버리스 기능 또는 스토리지 버킷(*autogen-bucket-id*.cloud.example.com) 등과 같은 DNS 항목 또는 DNS 하위 도메인에 의존하는 경우 애플리케이션이 하위 도메인 탈취로부터 보호되는지 확인합니다. 애플리케이션에서 사용하는 DNS 이름의 만료 또는 변경 여부를 정기적으로 확인하는 것도 보호 조치에 포함될 수 있습니다.
8. 애플리케이션에 대량 데이터 유출, 비즈니스 로직 요청, 파일 업로드 또는 서비스 거부 공격과 같은 과도한 호출로부터 보호하기 위한 자동화 방지 제어 기능이 있는지 확인합니다.
9. 신뢰할 수 없는 출처에서 얻은 파일이 제한된 권한으로 웹 루트 외부에 저장되어 있는지 확인합니다.
10. 신뢰할 수 없는 출처에서 얻은 파일을 바이러스 백신 스캐너로 검사하여 알려진 악성 콘텐츠의 업로드 및 제공을 방지합니다.
11. API URL이 API 키, 세션 토큰 등과 같은 민감한 정보를 노출하지 않는지 확인합니다.
12. 컨트롤러 또는 라우터에서 프로그래밍 방식 또는 선언적 보안으로 시행되는 URI와 모델 기반 권한으로 시행되는 리소스 수준에서 권한 부여 결정이 이루어졌는지 확인합니다.
13. 보호된 API 또는 리소스에서 일반 사용자가 DELETE 또는 PUT을 사용하지 못하도록 하는 등 활성화된RESTful HTTP 메서드가 사용자 또는 작업에 유효한 선택인지 확인합니다.
14. CI/CD 자동화, 자동화된 구성 관리, 자동화된 배포 스크립트 등 애플리케이션 빌드 및 배포 프로세스가 안전하고 반복 가능한 방식으로 수행되는지 확인합니다.
15. 애플리케이션, 구성 및 모든 종속성이 자동화된 배포 스크립트를 사용하여 다시 배포되고, 문서화되고 테스트된 런북을 통해 적절한 시간 내에 구축되거나 백업에서 적시에 복원될 수 있는지 확인합니다.
16. 권한이 있는 관리자가 모든 보안 관련 구성의 무결성을 확인하여 변조를 감지할 수 있는지 확인합니다.
17. 디버그 기능, 개발자 콘솔 및 의도하지 않은 보안 공개를 제거하기 위해 웹 또는 애플리케이션 서버 및 애플리케이션 프레임워크 디버그 모드가 프로덕션 환경에서 비활성화되어 있는지 확인합니다.
18. 오리진 헤더는 공격자가 쉽게 변경할 수 있으므로 제공된 오리진 헤더가 인증 또는 액세스 제어 결정에 사용되지 않는지 확인합니다.
19. 쿠키 기반 세션 토큰이 사이트 간 요청 위조 공격에 대한 노출을 제한하기 위해 'SameSite' 속성을 사용하는지 확인합니다. ([C6](https://owasp.org/www-project-proactive-controls/#div-numbering))
20. 애플리케이션이 LDAP 인젝션 취약점으로부터 보호하는지 또는 LDAP 인젝션을 방지하기 위한 특정 보안 제어가 구현되었는지 확인합니다. ([C4](https://owasp.org/www-project-proactive-controls/#div-numbering))
21. 애플리케이션이 로컬 파일 인클루전(LFI) 또는 원격 파일 인클루전(RFI) 공격으로부터 보호하는지 확인합니다.
22. 개인 식별 정보(PII), 민감한 개인 정보 또는 EU의 GDPR의 적용을 받을 가능성이 있는 것으로 평가되는 데이터 등 규제 대상 개인 데이터가 미사용 시 암호화되어 저장되는지 확인합니다.
23. 모든 암호화 작업이 상수 시간으로 수행되어야 하며, 비교, 계산 또는 반환 시 단축 회로 연산을 사용해서는 안 됩니다. 이는 정보를 누출하지 않기 위해 중요합니다.