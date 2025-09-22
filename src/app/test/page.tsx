export default function TestPage() {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>테스트 페이지</h1>
      <p>이 페이지가 보이면 Next.js가 정상 작동하고 있습니다.</p>
      <p>현재 시간: {new Date().toLocaleString('ko-KR')}</p>
    </div>
  );
}