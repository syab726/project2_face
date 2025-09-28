import ShortsGenerator from '@/components/ShortsGenerator';

export default function ShortsPage() {
  return (
    <div className=\"min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8\">
      <div className=\"container mx-auto px-4\">
        <ShortsGenerator />
      </div>
    </div>
  );
}

export const metadata = {
  title: '유튜브 쇼츠 자동 생성기 | Face Wisdom',
  description: '유명인 관상 분석 쇼츠를 자동으로 생성해보세요. 이름과 사진만 있으면 완성!',
  keywords: ['유튜브 쇼츠', '관상 분석', '자동 생성', '유명인', 'AI'],
};