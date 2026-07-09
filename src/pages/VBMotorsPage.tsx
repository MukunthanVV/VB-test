import TopNavBar from '../components/TopNavBar';
import NormalFooter from '../components/NormalFooter';
import AnimatedTopo from '../components/AnimatedTopo';

const VBMotorsPage = () => {
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
            <h1 className="text-4xl md:text-7xl font-bold tracking-tight mb-6 uppercase text-[#1A1A1A] dark:text-white drop-shadow-sm">VB MOTORS</h1>
            <p className="text-xl md:text-2xl font-medium tracking-tight text-[#1A1A1A] dark:text-white max-w-3xl">
              Engineering the future of automotive luxury. Discover our premium car modification and detailing services.
            </p>
          </div>
          
          <div className="flex flex-col gap-12">
            {/* Service 1 */}
            <div className="flex flex-col md:flex-row bg-[#D7D1C9] dark:bg-neutral-800 rounded-[2rem] overflow-hidden shadow-xl w-full">
              <div className="w-full md:w-[60%] relative min-h-[300px] md:min-h-[480px] bg-[#C1BAB2] dark:bg-neutral-700 flex items-center justify-center border-b md:border-b-0 border-outline flex-shrink-0">
                 <span className="material-symbols-outlined text-7xl text-[#1A1A1A]/40 dark:text-white/40">car_repair</span>
              </div>
              <div className="w-full md:w-[40%] flex flex-col justify-center p-8 md:p-12 lg:p-16">
                <h3 className="text-3xl md:text-4xl font-bold mb-6 text-[#1A1A1A] dark:text-white uppercase">Performance Tuning</h3>
                <p className="text-xl text-[#1A1A1A]/80 dark:text-white/80 leading-relaxed">
                  Unlock the true potential of your vehicle with our custom performance tuning and engine modifications. Precision engineering for the ultimate driving experience.
                </p>
              </div>
            </div>

            {/* Service 2 */}
            <div className="flex flex-col md:flex-row-reverse bg-[#988E8B] dark:bg-neutral-900 rounded-[2rem] overflow-hidden shadow-xl w-full">
              <div className="w-full md:w-[60%] relative min-h-[300px] md:min-h-[480px] bg-[#8F8A8B] dark:bg-neutral-800 flex items-center justify-center border-b md:border-b-0 border-outline flex-shrink-0">
                 <span className="material-symbols-outlined text-7xl text-[#1A1A1A]/40 dark:text-white/40">directions_car</span>
              </div>
              <div className="w-full md:w-[40%] flex flex-col justify-center p-8 md:p-12 lg:p-16">
                <h3 className="text-3xl md:text-4xl font-bold mb-6 text-[#1A1A1A] dark:text-white uppercase">Luxury Detailing</h3>
                <p className="text-xl text-[#1A1A1A]/80 dark:text-white/80 leading-relaxed">
                  Meticulous interior and exterior detailing services. We restore, protect, and elevate your vehicle's aesthetic appeal to showroom perfection.
                </p>
              </div>
            </div>
            
             {/* Service 3 */}
            <div className="flex flex-col md:flex-row bg-[#D7D1C9] dark:bg-neutral-800 rounded-[2rem] overflow-hidden shadow-xl w-full">
              <div className="w-full md:w-[60%] relative min-h-[300px] md:min-h-[480px] bg-[#C1BAB2] dark:bg-neutral-700 flex items-center justify-center border-b md:border-b-0 border-outline flex-shrink-0">
                 <span className="material-symbols-outlined text-7xl text-[#1A1A1A]/40 dark:text-white/40">airport_shuttle</span>
              </div>
              <div className="w-full md:w-[40%] flex flex-col justify-center p-8 md:p-12 lg:p-16">
                <h3 className="text-3xl md:text-4xl font-bold mb-6 text-[#1A1A1A] dark:text-white uppercase">Custom Modifications</h3>
                <p className="text-xl text-[#1A1A1A]/80 dark:text-white/80 leading-relaxed">
                  Bespoke exterior and interior modifications tailored to your exact specifications. Stand out from the crowd with our signature styling.
                </p>
              </div>
            </div>
            
             {/* Service 4 */}
            <div className="flex flex-col md:flex-row-reverse bg-[#988E8B] dark:bg-neutral-900 rounded-[2rem] overflow-hidden shadow-xl w-full">
              <div className="w-full md:w-[60%] relative min-h-[300px] md:min-h-[480px] bg-[#8F8A8B] dark:bg-neutral-800 flex items-center justify-center border-b md:border-b-0 border-outline flex-shrink-0">
                 <span className="material-symbols-outlined text-7xl text-[#1A1A1A]/40 dark:text-white/40">auto_awesome</span>
              </div>
              <div className="w-full md:w-[40%] flex flex-col justify-center p-8 md:p-12 lg:p-16">
                <h3 className="text-3xl md:text-4xl font-bold mb-6 text-[#1A1A1A] dark:text-white uppercase">Ceramic Coating & PPF</h3>
                <p className="text-xl text-[#1A1A1A]/80 dark:text-white/80 leading-relaxed">
                  Ultimate paint protection with industry-leading ceramic coatings and paint protection films. Safeguard your investment for years to come.
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

export default VBMotorsPage;
