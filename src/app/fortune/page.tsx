'use client';

import FortuneAnalyzer from '@/components/FortuneAnalyzer';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function FortunePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 bg-gray-50">
        <section className="section-padding">
          <div className="container-custom">
            <FortuneAnalyzer 
              onBack={() => {
                window.history.back();
              }}
            />
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}