/**
 * 중앙화된 WebSocket 설정 (config.js)
 * 로컬 개발과 실제 배포 환경 간의 연결 전환을 담당합니다.
 */

function getWsUrl(defaultPort = 8080) {
  // 1. localStorage에 저장된 사용자 정의 URL이 있는지 확인
  const customUrl = localStorage.getItem('ws_server_url');
  if (customUrl) {
    // 사용자가 'wss://my-server.render.com' 처럼 입력했을 경우
    let url = customUrl.trim();
    if (!url.startsWith('ws://') && !url.startsWith('wss://')) {
      url = (window.location.protocol === 'https:' ? 'wss://' : 'ws://') + url;
    }

    // 만약 Pattern 2(8081)를 요청하는 경우, 단일 포트 서버의 /p2 경로로 유도
    if (defaultPort === 8081) {
      const parsed = new URL(url);
      if (parsed.pathname === '/' || parsed.pathname === '') {
        parsed.pathname = '/p2';
      }
      return parsed.toString();
    }
    return url;
  }

  // 2. 기본값 결정
  // 로컬 호스트일 경우 개발 서버 사용, 그렇지 않으면 실제 배포된 Render 서버 사용
  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

  if (isLocal) {
    return `ws://localhost:${defaultPort}`;
  } else {
    // 실제 배포된 Render 백엔드 주소
    const prodBase = 'wss://websockets-learn-backend.onrender.com';
    return defaultPort === 8081 ? `${prodBase}/p2` : prodBase;
  }
}

// 전역 변수로 노출 (모든 learn*.html에서 사용 가능하게)
window.getWsUrl = getWsUrl;
