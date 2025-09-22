// Window 객체에 추가되는 라이브러리 타입 선언

declare global {
  interface Window {
    html2canvas: any;
    jspdf: {
      jsPDF: any;
    };
  }
}

export {};