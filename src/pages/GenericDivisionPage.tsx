
import { useParams } from 'react-router-dom';
import EditableDivisionPage from '../components/EditableDivisionPage';

// Default Fallback Template for brand new divisions
const genericHero = {
  title: 'NEW DIVISION',
  description: 'Enter a description for your new division here.',
  videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4'
};

const genericServices = [
  {
    id: 't1',
    order: 1,
    title: 'Example Service',
    description: 'Description of your service goes here.',
    icon: 'star',
  }
];

// Specific fallbacks for the original 4 templates to preserve the demo look
const fallbackMap: Record<string, any> = {
  's1': {
    hero: {
      title: 'VB MOTORS',
      description: 'Engineering the future of automotive luxury. Discover our premium car modification and detailing services.',
      videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4'
    },
    services: [
      { id: 's1_1', order: 1, title: 'Performance Tuning', description: 'Unlock the true potential of your vehicle.', icon: 'car_repair' },
      { id: 's1_2', order: 2, title: 'Luxury Detailing', description: 'Meticulous interior and exterior detailing.', icon: 'directions_car' },
      { id: 's1_3', order: 3, title: 'Custom Modifications', description: 'Bespoke exterior and interior modifications.', icon: 'airport_shuttle' },
      { id: 's1_4', order: 4, title: 'Ceramic Coating & PPF', description: 'Ultimate paint protection.', icon: 'auto_awesome' }
    ]
  },
  's2': {
    hero: {
      title: 'USED CAR SALES',
      description: 'Discover a curated selection of premium pre-owned vehicles. Uncompromising quality, rigorous inspection, and unmatched value.',
      videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4'
    },
    services: [
      { id: 's2_1', order: 1, title: 'Certified Pre-Owned', description: 'Every vehicle undergoes a rigorous 150-point inspection.', icon: 'verified' },
      { id: 's2_2', order: 2, title: 'Premium Selection', description: 'Browse our exclusive inventory of luxury sedans.', icon: 'directions_car' },
      { id: 's2_3', order: 3, title: 'Trade-In & Financing', description: 'We offer competitive trade-in values.', icon: 'currency_exchange' },
      { id: 's2_4', order: 4, title: 'Client Advisory', description: 'Our expert automotive advisors are here to guide you.', icon: 'handshake' }
    ]
  },
  's3': {
    hero: {
      title: 'VB EVENT MANAGEMENT',
      description: 'Orchestrating unforgettable experiences. From corporate gatherings to grand celebrations, we deliver flawless event execution.',
      videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4'
    },
    services: [
      { id: 's3_1', order: 1, title: 'Corporate Events', description: 'Conferences, product launches, and corporate retreats.', icon: 'business_center' },
      { id: 's3_2', order: 2, title: 'Grand Celebrations', description: 'Bespoke weddings, galas, and milestone celebrations.', icon: 'festival' },
      { id: 's3_3', order: 3, title: 'Entertainment & Production', description: 'State-of-the-art audiovisual production.', icon: 'theater_comedy' },
      { id: 's3_4', order: 4, title: 'Hospitality & Catering', description: 'Curated culinary experiences and exceptional hospitality services.', icon: 'restaurant_menu' }
    ]
  },
  's4': {
    hero: {
      title: 'VB REAL ESTATE & CONSTRUCTIONS',
      description: 'Curating a legacy of iconic properties globally. Delivering complex infrastructure with an unwavering commitment to safety and innovation.',
      videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4'
    },
    services: [
      { id: 's4_1', order: 1, title: 'Commercial Development', description: 'Developing cutting-edge office spaces.', icon: 'location_city' },
      { id: 's4_2', order: 2, title: 'Luxury Residential', description: 'Crafting bespoke luxury homes.', icon: 'house' },
      { id: 's4_3', order: 3, title: 'Infrastructure Projects', description: 'Executing large-scale infrastructure developments.', icon: 'engineering' },
      { id: 's4_4', order: 4, title: 'Architectural Design', description: 'Innovative architectural services.', icon: 'architecture' }
    ]
  }
};

const GenericDivisionPage = () => {
  const { id } = useParams<{ id: string }>();
  
  if (!id) return null;

  const fallbackData = fallbackMap[id] || { hero: genericHero, services: genericServices };

  return (
    <EditableDivisionPage 
      key={id} // Force re-mount if URL changes
      pageId={id} 
      fallbackHero={fallbackData.hero} 
      fallbackServices={fallbackData.services} 
    />
  );
};

export default GenericDivisionPage;
