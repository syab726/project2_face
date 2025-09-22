import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">얼</span>
              </div>
              <span className="text-lg font-bold">내 얼굴 탐구생활</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              AI와 전통 관상학이 만난 <br />
              새로운 얼굴 분석 서비스
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <span className="sr-only">Facebook</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <span className="sr-only">Instagram</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987c6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.328-1.297L6.391 14.5c.603.548 1.381.887 2.058.887.995 0 1.809-.814 1.809-1.809s-.814-1.809-1.809-1.809c-.677 0-1.455.339-2.058.887L4.121 11.47c.88-.807 2.031-1.297 3.328-1.297c2.629 0 4.765 2.135 4.765 4.765s-2.135 4.765-4.765 4.765z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold text-lg mb-4">서비스</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/analysis" className="text-gray-400 hover:text-white transition-colors">
                  얼굴 MBTI 분석
                </Link>
              </li>
              <li>
                <Link href="/idealtype" className="text-gray-400 hover:text-white transition-colors">
                  이상형 이미지 생성
                </Link>
              </li>
              <li>
                <Link href="/palmistry" className="text-gray-400 hover:text-white transition-colors">
                  손금 분석
                </Link>
              </li>
              <li>
                <Link href="/fortune" className="text-gray-400 hover:text-white transition-colors">
                  사주 분석
                </Link>
              </li>
              <li>
                <Link href="/comprehensive" className="text-gray-400 hover:text-white transition-colors">
                  종합 리포트
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-lg mb-4">고객지원</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/faq" className="text-gray-400 hover:text-white transition-colors">
                  자주 묻는 질문
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-white transition-colors">
                  문의하기
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-gray-400 hover:text-white transition-colors">
                  요금안내
                </Link>
              </li>
              <li>
                <Link href="/guide" className="text-gray-400 hover:text-white transition-colors">
                  이용가이드
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-lg mb-4">약관 및 정책</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/terms" className="text-gray-400 hover:text-white transition-colors">
                  이용약관
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">
                  개인정보처리방침
                </Link>
              </li>
              <li>
                <Link href="/refund" className="text-gray-400 hover:text-white transition-colors">
                  환불정책
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2025 내 얼굴 탐구생활. All rights reserved.
          </p>
          <p className="text-gray-400 text-sm mt-4 md:mt-0">
            Made with ❤️ for better self-understanding
          </p>
        </div>
      </div>
    </footer>
  );
}