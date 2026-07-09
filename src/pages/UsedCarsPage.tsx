import TopNavBar from '../components/TopNavBar';
import NormalFooter from '../components/NormalFooter';
import AnimatedTopo from '../components/AnimatedTopo';

const UsedCarsPage = () => {
  return (
    <>
      <AnimatedTopo />
      <TopNavBar />

      {/* Video Hero Section */}
      <div className="w-full h-[60vh] md:h-[80vh] relative overflow-hidden mt-[65px] md:mt-[73px]">
        <div className="absolute inset-0 bg-black/40 z-10 flex items-center justify-center pointer-events-none">
          <span className="material-symbols-outlined text-white/70 text-7xl drop-shadow-lg pointer-events-auto cursor-pointer hover:text-white transition-colors duration-300">play_circle</span>
        </div>
        <video 
          autoPlay 
          loop 
          muted 
          playsInline 
          className="absolute inset-0 w-full h-full object-cover"
        >
          {/* Placeholder video - replace with actual work video */}
          <source src="https://www.w3schools.com/html/mov_bbb.mp4" type="video/mp4" />
        </video>
      </div>

      <main className="pt-16 pb-24 px-4 md:px-8 lg:px-12">
        <div className="max-w-container-max mx-auto">
          <div className="mb-16">
            <h1 className="text-4xl md:text-7xl font-bold tracking-tight mb-6 uppercase text-[#1A1A1A] dark:text-white drop-shadow-sm">USED CAR SALES</h1>
            <p className="text-xl md:text-2xl font-medium tracking-tight text-[#1A1A1A] dark:text-white max-w-3xl">
              Discover a curated selection of premium pre-owned vehicles. Uncompromising quality, rigorous inspection, and unmatched value.
            </p>
          </div>
          
          <div className="flex flex-col gap-12">
            {/* Service 1 */}
            <div className="flex flex-col md:flex-row bg-[#D7D1C9] dark:bg-neutral-800 rounded-[2rem] overflow-hidden shadow-xl w-full">
              <div className="w-full md:w-[60%] relative min-h-[300px] md:min-h-[480px] bg-[#C1BAB2] dark:bg-neutral-700 flex items-center justify-center border-b md:border-b-0 border-outline flex-shrink-0">
                 <span className="material-symbols-outlined text-7xl text-[#1A1A1A]/40 dark:text-white/40">verified</span>
              </div>
              <div className="w-full md:w-[40%] flex flex-col justify-center p-8 md:p-12 lg:p-16">
                <h3 className="text-3xl md:text-4xl font-bold mb-6 text-[#1A1A1A] dark:text-white uppercase">Certified Pre-Owned</h3>
                <p className="text-xl text-[#1A1A1A]/80 dark:text-white/80 leading-relaxed">
                  Every vehicle undergoes a rigorous 150-point inspection to ensure the highest quality and peace of mind for your purchase.
                </p>
              </div>
            </div>

            {/* Service 2 */}
            <div className="flex flex-col md:flex-row-reverse bg-[#988E8B] dark:bg-neutral-900 rounded-[2rem] overflow-hidden shadow-xl w-full">
              <div className="w-full md:w-[60%] relative min-h-[300px] md:min-h-[480px] bg-[#8F8A8B] dark:bg-neutral-800 flex items-center justify-center border-b md:border-b-0 border-outline flex-shrink-0">
                 <span className="material-symbols-outlined text-7xl text-[#1A1A1A]/40 dark:text-white/40">directions_car</span>
              </div>
              <div className="w-full md:w-[40%] flex flex-col justify-center p-8 md:p-12 lg:p-16">
                <h3 className="text-3xl md:text-4xl font-bold mb-6 text-[#1A1A1A] dark:text-white uppercase">Premium Selection</h3>
                <p className="text-xl text-[#1A1A1A]/80 dark:text-white/80 leading-relaxed">
                  Browse our exclusive inventory of luxury sedans, performance sports cars, and premium SUVs carefully selected for our discerning clientele.
                </p>
              </div>
            </div>
            
             {/* Service 3 */}
            <div className="flex flex-col md:flex-row bg-[#D7D1C9] dark:bg-neutral-800 rounded-[2rem] overflow-hidden shadow-xl w-full">
              <div className="w-full md:w-[60%] relative min-h-[300px] md:min-h-[480px] bg-[#C1BAB2] dark:bg-neutral-700 flex items-center justify-center border-b md:border-b-0 border-outline flex-shrink-0">
                 <span className="material-symbols-outlined text-7xl text-[#1A1A1A]/40 dark:text-white/40">currency_exchange</span>
              </div>
              <div className="w-full md:w-[40%] flex flex-col justify-center p-8 md:p-12 lg:p-16">
                <h3 className="text-3xl md:text-4xl font-bold mb-6 text-[#1A1A1A] dark:text-white uppercase">Trade-In & Financing</h3>
                <p className="text-xl text-[#1A1A1A]/80 dark:text-white/80 leading-relaxed">
                  We offer competitive trade-in values for your current vehicle and flexible financing options tailored to your needs.
                </p>
              </div>
            </div>
            
             {/* Service 4 */}
            <div className="flex flex-col md:flex-row-reverse bg-[#988E8B] dark:bg-neutral-900 rounded-[2rem] overflow-hidden shadow-xl w-full">
              <div className="w-full md:w-[60%] relative min-h-[300px] md:min-h-[480px] bg-[#8F8A8B] dark:bg-neutral-800 flex items-center justify-center border-b md:border-b-0 border-outline flex-shrink-0">
                 <span className="material-symbols-outlined text-7xl text-[#1A1A1A]/40 dark:text-white/40">handshake</span>
              </div>
              <div className="w-full md:w-[40%] flex flex-col justify-center p-8 md:p-12 lg:p-16">
                <h3 className="text-3xl md:text-4xl font-bold mb-6 text-[#1A1A1A] dark:text-white uppercase">Client Advisory</h3>
                <p className="text-xl text-[#1A1A1A]/80 dark:text-white/80 leading-relaxed">
                  Our expert automotive advisors are here to guide you seamlessly through the entire purchasing process.
                </p>
              </div>
            </div>
            
          </div>
        </div>
      </main>
      <NormalFooter />
    </>
  );
};

export default UsedCarsPage;
