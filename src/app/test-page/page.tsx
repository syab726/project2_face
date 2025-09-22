export default function TestPage() {
  return (
    <div className="p-8">
      <h1>API 테스트 페이지</h1>
      <p>현재 시간: {new Date().toISOString()}</p>
      <p>이 페이지가 보인다면 Next.js는 정상 작동 중입니다.</p>
    </div>
  );
}