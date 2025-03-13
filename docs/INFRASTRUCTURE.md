# Infrastructure
```mermaid
flowchart TD
  subgraph fe["Frontend Application"]
    subgraph index["Key Features"]
      chat@{ label: "Chat Application", img: "https://api.iconify.design/hugeicons:chatting-01.svg", constraint: "on", w: 60, h: 60 }
      editor@{ label: "Workflow Editor", img: "https://api.iconify.design/pepicons-pop:paint-pallet.svg", constraint: "on", w: 60, h: 60 }
      dashboard@{ label: "Dashboard", img: "https://api.iconify.design/pajamas:dashboard.svg", constraint: "on", w: 60, h: 60 }
      widget@{ label: "Widget", img: "https://api.iconify.design/streamline:widget.svg", constraint: "on", w: 60, h: 60 }
    end
    inspector(["JSON Value Composer"])
    validator(["Visual Node Validator"])
    viewer(["Return Value Viewer"])
    editor --"composes"--> inspector
    editor --"validates"--> validator
    editor --"renders" --> viewer
  end
  subgraph be[Backend System]
    hub_db@{ label: "Database", img: "https://api.iconify.design/simple-icons:postgresql.svg", constraint: "on", w: 60, h: 60 }
    api@{ label: "API Server", img: "https://api.iconify.design/simple-icons:amazonec2.svg", constraint: "on", w: 60, h: 60 }
    session@{ label: "Action LLM Session", img: "https://api.iconify.design/logos:websocket.svg", constraint: "on", w: 60, h: 60 }
    codegen@{ label: "Compiler (codegen)", img: "https://api.iconify.design/catppuccin:typescript-def.svg", constraint: "on", w: 60, h: 60 }
    runtime@{ label: "Runtime", img: "https://api.iconify.design/codicon:debug-console.svg", constraint: "on", w: 60, h: 60 }
    sandbox@{ label: "Sandbox Isolation", img: "https://api.iconify.design/material-symbols:lock-clock-outline-sharp.svg", constraint: "on", w: 60, h: 60 }
    s3@{ label: "Disk Storage", img: "https://api.iconify.design/codicon:save-all.svg", constraint: "on", w: 60, h: 60 }
    api --"interacts"--> hub_db
    api --"stores"--> s3
    api --"compiles"--> codegen
    api --"executes"--> runtime
    api --"opens"--> session
    runtime --"security" --> sandbox
    session --"security" --> sandbox
  end
  subgraph connector["Connector Ecosystem"]
    connector_backend@{ label: "Connector Server", img: "https://api.iconify.design/streamline:interface-content-chart-product-data-analysis-analytics-graph-line-business-board-chart.svg", constraint: "on", w: 60, h: 60 }
    connector_store@{ label: "OpenAPI Marketplace", img: "https://api.iconify.design/simple-icons:swagger.svg", constraint: "on", w: 60, h: 60 }
    connector_application@{ label: "Application<br/>Function<br/>Calling", img: "https://api.iconify.design/zondicons:mobile-devices.svg", constraint: "on", w: 60, h: 60 }
  end
  subgraph agent["Action Agent"]
    main@{ label: "Main Agent", img: "https://api.iconify.design/ci:main-component.svg", constraint: "on", w: 60, h: 60 }
    subgraph resources["Resources"]
      direction TB
      history@{ label: "History Database", img: "https://api.iconify.design/material-symbols:database-sharp.svg", constraint: "on", w: 60, h: 60 }
      swlc@{ label: "SWL Compiler", img: "https://api.iconify.design/mdi:language-rust.svg", constraint: "on", w: 60, h: 60 }
      bridge@{ label: "Communication Bridge", img: "https://api.iconify.design/devicon:apachekafka.svg", constraint: "on", w: 60, h: 60 }
      provider@{ label: "Connector Provider", img: "https://api.iconify.design/carbon:partition-collection.svg", constraint: "on", w: 60, h: 60 }
    end
    subgraph sub["Sub Agents"]
      direction TB
      connector_finder(("Connector<br/>Finder"))
      connector_usecase_generator(("Usecase<br/>Generator"))
      connector_argument_composer(("Argument<br/>Composer"))
      workflow_generator(("Workflow <br/>Generator"))
      template_instantiator(("Template<br/>Iinitiator"))
    end
    main <--"Emit Event & Message"--> resources
    resources <--"Access External Infrastructure"--> sub
    main <--"Dispatch Task"--> sub
  end
  sdk[["Software Development Kit"]]
  wasm[["WebAssembly Bridge"]]
  schema[["LLM Schema Layer"]]
  fe --calls--> sdk
  sdk --interacts--> be
  connector --converts--> schema
  schema --migrate--> be
  be --calls--> wasm
  wasm --interacts--> agent
```

## Outline
본 서비스는 다음과 같이 4 개의 백엔드 서버로 구성됨.

  - Backend: 허브의 메인 백엔드 서버
  - Proxy: API 중개 프록시 서버
  - Mutex: 네트워크 수준 임계 영역 제어 서버
  - Payments: 통합 결제 서버

그리고 이 중 Payment 서버는 로컬 및 테스트 서버에서 구동시, 가짜 아임포트 및 토스 페이먼츠 서버가 함께 구동된다. 또한 예제 API 로써, 간단한 게시판 백엔드 시스템 또한 함께 제공된다. 따라서 로컬 및 테스트 서버 기준으로는 총 7 개의 서버가 존재하고, 실서버 기준으로는 4 개의 서버가 존재한다.

  - Both real and test system
    - Backend
    - Proxy
    - Mutex
    - Payments
  - Test system only
    - Iamport
    - Toss Payments
    - Bulletin Board

이외에 DB 로는 postgres 를 사용하고 있으며, 향후 서비스 고도화에 따라 스택을 구성하는 시스템들이 늘어날 예정이다.




## Deployment
배포시 PR 의 커밋 메시지에 다음 단어를 추가해주면 된다.

  - `ci:be`
  - `ci:proxy`
  - `ci:mutex`



## CI TEST
PR 요청시 해당 브랜치에 "test_" 로 시작하는 파일이 있다면 그 파일만 테스트를 실행함.

해당 PR에서 변경된 테스트 말고 돌리고 싶다면 커밋메시지에 TEST 하고 싶은 파일 명을 추가하면 된다.