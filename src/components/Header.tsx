import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">얼</span>
            </div>
            <span className="text-xl font-bold text-gray-900">
              내 얼굴 탐구생활
            </span>
          </Link>

          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/free-test" className="text-gray-700 hover:text-indigo-600 transition-colors font-medium">
              무료 테스트
            </Link>
            <Link href="/gwansang" className="text-gray-700 hover:text-indigo-600 transition-colors font-medium">
              관상 분석
            </Link>
            <Link href="/service" className="text-gray-700 hover:text-indigo-600 transition-colors font-medium">
              서비스 소개
            </Link>
          </nav>

          {/* 모바일 메뉴는 간단히 무료 테스트 링크만 표시 */}
          <div className="md:hidden">
            <Link
              href="/free-test"
              className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-indigo-600 hover:to-purple-700 transition-all"
            >
              무료 테스트
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}