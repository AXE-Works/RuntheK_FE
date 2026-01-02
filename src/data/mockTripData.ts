/**
 * Mock Trip Data for Testing
 *
 * 3개의 샘플 여행 일정 데이터 (BE API 응답 형식)
 * 모든 새 필드 포함: googleMapsUrl, priceRange, imageUrl, recommendationReason, transport 정보
 */

export interface MockTripActivity {
  time: string;
  activity: string;
  location: string;
  description: string;
  estimatedCost: string;
  isEvent: boolean;
  eventType: string | null;
  eventId: string | null;
  rating: number | null;
  // 지도/장소 정보
  googleMapsUrl: string | null;
  priceRange: string | null;
  imageUrl: string | null;
  recommendationReason: string | null;
  // Transport 정보
  transportMode: string | null;
  transportDuration: number | null;
  transportDistance: number | null;
  transportDetails: string | null;
  transportCost: string | null;
}

export interface MockTripDay {
  day: number;
  title: string;
  activities: MockTripActivity[];
}

export interface MockTripData {
  id: string;
  title: string;
  duration: string;
  interests: string[];
  budget: string;
  status: string;
  startDate: string;
  endDate: string;
  confirmedAt: string;
  cities: string[];
  daysCount: number;
  activitiesCount: number;
  days: MockTripDay[];
  totalEstimatedCost: string;
  averageRating: number | null;
  ratings: any[];
  travelTips: string[];
  warnings: string[];
}

// ===== Mock Trip 1: 서울 미식 여행 3일 =====
export const mockTrip1: MockTripData = {
  id: "trip-001",
  title: "서울 미식 여행 3일",
  duration: "3 days",
  interests: ["food", "culture"],
  budget: "mid-range",
  status: "upcoming",
  startDate: "2025-02-15",
  endDate: "2025-02-17",
  confirmedAt: "2025-01-02T10:30:00Z",
  cities: ["Seoul"],
  daysCount: 3,
  activitiesCount: 12,
  totalEstimatedCost: "₩450,000 - ₩650,000",
  averageRating: null,
  ratings: [],
  travelTips: [
    "T-money 카드를 구매하면 대중교통 이용이 편리합니다",
    "현금을 준비하세요 - 전통시장은 카드가 안 되는 곳이 많습니다",
    "점심시간(12-1시)에는 맛집이 붐비니 조금 일찍 방문하세요"
  ],
  warnings: [],
  days: [
    {
      day: 1,
      title: "광장시장 & 종로 미식투어",
      activities: [
        {
          time: "10:00",
          activity: "광장시장 먹거리 투어",
          location: "서울특별시 종로구 창경궁로 88",
          description: "100년 역사의 전통시장에서 빈대떡, 마약김밥, 육회를 맛보세요",
          estimatedCost: "₩15,000 - ₩25,000",
          isEvent: false,
          eventType: null,
          eventId: null,
          rating: null,
          googleMapsUrl: "https://maps.google.com/?q=37.570037,126.999651",
          priceRange: "$$",
          imageUrl: "https://example.com/gwangjang-market.jpg",
          recommendationReason: "서울에서 가장 오래된 전통시장으로 한국 길거리 음식의 정수를 경험할 수 있습니다",
          transportMode: null,
          transportDuration: null,
          transportDistance: null,
          transportDetails: null,
          transportCost: null
        },
        {
          time: "12:30",
          activity: "을지로 노포 골목",
          location: "서울특별시 중구 을지로3가",
          description: "50년 넘은 노포들이 모여있는 골목에서 점심식사",
          estimatedCost: "₩12,000 - ₩18,000",
          isEvent: false,
          eventType: null,
          eventId: null,
          rating: null,
          googleMapsUrl: "https://maps.google.com/?q=37.566295,126.992035",
          priceRange: "$",
          imageUrl: "https://example.com/euljiro.jpg",
          recommendationReason: "레트로 감성의 힙한 골목으로 변신한 을지로에서 전통과 현대가 공존하는 식문화를 경험하세요",
          transportMode: "walking",
          transportDuration: 15,
          transportDistance: 1.2,
          transportDetails: null,
          transportCost: null
        },
        {
          time: "15:00",
          activity: "익선동 한옥거리 카페",
          location: "서울특별시 종로구 수표로28길",
          description: "100년 된 한옥에서 즐기는 전통차와 디저트",
          estimatedCost: "₩8,000 - ₩15,000",
          isEvent: false,
          eventType: null,
          eventId: null,
          rating: null,
          googleMapsUrl: "https://maps.google.com/?q=37.572535,126.991272",
          priceRange: "$$",
          imageUrl: "https://example.com/ikseon-cafe.jpg",
          recommendationReason: "전통 한옥과 현대적 카페 문화가 조화롭게 어우러진 인스타그램 핫플레이스",
          transportMode: "walking",
          transportDuration: 10,
          transportDistance: 0.7,
          transportDetails: null,
          transportCost: null
        },
        {
          time: "19:00",
          activity: "종로 포장마차 골목",
          location: "서울특별시 종로구 종로 일대",
          description: "노천 포장마차에서 소주와 함께 즐기는 저녁",
          estimatedCost: "₩25,000 - ₩40,000",
          isEvent: false,
          eventType: null,
          eventId: null,
          rating: null,
          googleMapsUrl: "https://maps.google.com/?q=37.570127,126.982917",
          priceRange: "$$",
          imageUrl: "https://example.com/pojangmacha.jpg",
          recommendationReason: "한국 야식 문화의 상징인 포장마차에서 현지인처럼 저녁을 즐겨보세요",
          transportMode: "transit",
          transportDuration: 20,
          transportDistance: 2.5,
          transportDetails: "1호선 종로3가역 하차",
          transportCost: "₩1,400"
        }
      ]
    },
    {
      day: 2,
      title: "강남 미식 & 트렌디 카페",
      activities: [
        {
          time: "11:00",
          activity: "가담 한식 레스토랑",
          location: "서울특별시 강남구 언주로167길 35 (신사동)",
          description: "미슐랭 빕구르망 한식 레스토랑에서 브런치",
          estimatedCost: "₩35,000 - ₩50,000",
          isEvent: false,
          eventType: null,
          eventId: null,
          rating: null,
          googleMapsUrl: "https://maps.google.com/?q=37.524891,127.037562",
          priceRange: "$$$",
          imageUrl: "https://example.com/gadam.jpg",
          recommendationReason: "현대적으로 재해석한 한식을 우아한 분위기에서 즐길 수 있는 미슐랭 추천 레스토랑",
          transportMode: null,
          transportDuration: null,
          transportDistance: null,
          transportDetails: null,
          transportCost: null
        },
        {
          time: "14:00",
          activity: "압구정로데오 카페거리",
          location: "서울특별시 강남구 압구정로데오거리",
          description: "트렌디한 디저트 카페 투어",
          estimatedCost: "₩12,000 - ₩20,000",
          isEvent: false,
          eventType: null,
          eventId: null,
          rating: null,
          googleMapsUrl: "https://maps.google.com/?q=37.527234,127.040123",
          priceRange: "$$",
          imageUrl: "https://example.com/apgujeong-cafe.jpg",
          recommendationReason: "K-뷰티와 K-패션의 중심지에서 최신 트렌드 디저트를 경험하세요",
          transportMode: "walking",
          transportDuration: 12,
          transportDistance: 0.9,
          transportDetails: null,
          transportCost: null
        },
        {
          time: "17:00",
          activity: "성수동 카페거리",
          location: "서울특별시 성동구 성수동",
          description: "폐공장을 개조한 힙한 카페와 베이커리",
          estimatedCost: "₩10,000 - ₩18,000",
          isEvent: false,
          eventType: null,
          eventId: null,
          rating: null,
          googleMapsUrl: "https://maps.google.com/?q=37.544678,127.056789",
          priceRange: "$$",
          imageUrl: "https://example.com/seongsu.jpg",
          recommendationReason: "서울의 브루클린으로 불리는 성수동에서 독특한 카페 문화를 체험하세요",
          transportMode: "transit",
          transportDuration: 25,
          transportDistance: 5.2,
          transportDetails: "분당선 압구정로데오역 → 2호선 성수역",
          transportCost: "₩1,400"
        },
        {
          time: "19:00",
          activity: "갓포아키 도산공원점",
          location: "서울특별시 강남구 도산대로45길 8-3 쿠키빌딩",
          description: "프리미엄 오마카세 디너",
          estimatedCost: "₩80,000 - ₩120,000",
          isEvent: false,
          eventType: null,
          eventId: null,
          rating: null,
          googleMapsUrl: "https://maps.google.com/?q=37.523456,127.035678",
          priceRange: "$$$",
          imageUrl: "https://example.com/omakase.jpg",
          recommendationReason: "강남의 프리미엄 오마카세로 특별한 저녁 식사를 즐겨보세요",
          transportMode: "driving",
          transportDuration: 15,
          transportDistance: 3.8,
          transportDetails: null,
          transportCost: "₩8,000"
        }
      ]
    },
    {
      day: 3,
      title: "홍대 & 연남동 브런치",
      activities: [
        {
          time: "10:30",
          activity: "연남동 브런치 카페",
          location: "서울특별시 마포구 연남동",
          description: "경의선숲길 옆 감성 브런치 카페",
          estimatedCost: "₩18,000 - ₩28,000",
          isEvent: false,
          eventType: null,
          eventId: null,
          rating: null,
          googleMapsUrl: "https://maps.google.com/?q=37.566123,126.923456",
          priceRange: "$$",
          imageUrl: "https://example.com/yeonnam-brunch.jpg",
          recommendationReason: "경의선숲길의 여유로운 분위기에서 즐기는 감성 브런치",
          transportMode: null,
          transportDuration: null,
          transportDistance: null,
          transportDetails: null,
          transportCost: null
        },
        {
          time: "13:00",
          activity: "홍대 길거리 음식",
          location: "서울특별시 마포구 와우산로",
          description: "홍대 거리의 다양한 길거리 음식 체험",
          estimatedCost: "₩10,000 - ₩15,000",
          isEvent: false,
          eventType: null,
          eventId: null,
          rating: null,
          googleMapsUrl: "https://maps.google.com/?q=37.556789,126.923891",
          priceRange: "$",
          imageUrl: "https://example.com/hongdae-street.jpg",
          recommendationReason: "젊음의 거리 홍대에서 트렌디한 길거리 음식을 즐겨보세요",
          transportMode: "walking",
          transportDuration: 15,
          transportDistance: 1.0,
          transportDetails: null,
          transportCost: null
        },
        {
          time: "15:30",
          activity: "망원시장",
          location: "서울특별시 마포구 망원동",
          description: "로컬이 사랑하는 동네 시장에서 간식 투어",
          estimatedCost: "₩8,000 - ₩15,000",
          isEvent: false,
          eventType: null,
          eventId: null,
          rating: null,
          googleMapsUrl: "https://maps.google.com/?q=37.556234,126.904567",
          priceRange: "$",
          imageUrl: "https://example.com/mangwon-market.jpg",
          recommendationReason: "현지인들이 즐겨 찾는 동네 시장에서 진정한 한국 식문화를 경험하세요",
          transportMode: "transit",
          transportDuration: 12,
          transportDistance: 1.8,
          transportDetails: "6호선 망원역 하차",
          transportCost: "₩1,400"
        },
        {
          time: "18:30",
          activity: "합정동 고기골목",
          location: "서울특별시 마포구 합정동",
          description: "숯불 삼겹살로 마무리하는 서울 미식여행",
          estimatedCost: "₩30,000 - ₩45,000",
          isEvent: false,
          eventType: null,
          eventId: null,
          rating: null,
          googleMapsUrl: "https://maps.google.com/?q=37.549876,126.912345",
          priceRange: "$$",
          imageUrl: "https://example.com/hapjeong-bbq.jpg",
          recommendationReason: "한국 여행의 하이라이트! 정통 숯불 삼겹살로 미식 여행을 마무리하세요",
          transportMode: "walking",
          transportDuration: 18,
          transportDistance: 1.3,
          transportDetails: null,
          transportCost: null
        }
      ]
    }
  ]
};

// ===== Mock Trip 2: 부산 해안 힐링 5일 =====
export const mockTrip2: MockTripData = {
  id: "trip-002",
  title: "부산 해안 힐링 5일",
  duration: "5 days",
  interests: ["nature", "food", "culture"],
  budget: "mid-range",
  status: "upcoming",
  startDate: "2025-03-01",
  endDate: "2025-03-05",
  confirmedAt: "2025-01-02T14:20:00Z",
  cities: ["Busan"],
  daysCount: 5,
  activitiesCount: 20,
  totalEstimatedCost: "₩800,000 - ₩1,200,000",
  averageRating: null,
  ratings: [],
  travelTips: [
    "부산 시티투어버스를 이용하면 주요 관광지를 편하게 둘러볼 수 있습니다",
    "해운대는 여름철에 매우 붐비니 봄/가을 방문을 추천합니다",
    "자갈치시장은 오전에 방문해야 신선한 해산물을 맛볼 수 있습니다"
  ],
  warnings: [],
  days: [
    {
      day: 1,
      title: "해운대 & 동백섬",
      activities: [
        {
          time: "09:00",
          activity: "해운대 해수욕장 산책",
          location: "부산광역시 해운대구 우동",
          description: "부산의 상징적인 해변에서 아침 산책",
          estimatedCost: "무료",
          isEvent: false,
          eventType: null,
          eventId: null,
          rating: null,
          googleMapsUrl: "https://maps.google.com/?q=35.158698,129.160384",
          priceRange: "무료",
          imageUrl: "https://example.com/haeundae.jpg",
          recommendationReason: "한국에서 가장 유명한 해변으로 부산 여행의 시작점으로 완벽합니다",
          transportMode: null,
          transportDuration: null,
          transportDistance: null,
          transportDetails: null,
          transportCost: null
        },
        {
          time: "11:00",
          activity: "동백섬 해안 산책로",
          location: "부산광역시 해운대구 동백로",
          description: "APEC 하우스와 누리마루가 있는 아름다운 섬 산책",
          estimatedCost: "무료",
          isEvent: false,
          eventType: null,
          eventId: null,
          rating: null,
          googleMapsUrl: "https://maps.google.com/?q=35.153456,129.152789",
          priceRange: "무료",
          imageUrl: "https://example.com/dongbaek.jpg",
          recommendationReason: "해운대와 연결된 아름다운 섬으로 바다와 숲을 동시에 즐길 수 있습니다",
          transportMode: "walking",
          transportDuration: 20,
          transportDistance: 1.5,
          transportDetails: null,
          transportCost: null
        },
        {
          time: "13:00",
          activity: "해운대 회센터",
          location: "부산광역시 해운대구 중동",
          description: "신선한 회와 해산물 점심",
          estimatedCost: "₩40,000 - ₩60,000",
          isEvent: false,
          eventType: null,
          eventId: null,
          rating: null,
          googleMapsUrl: "https://maps.google.com/?q=35.162345,129.163456",
          priceRange: "$$$",
          imageUrl: "https://example.com/haeundae-sashimi.jpg",
          recommendationReason: "바다를 바라보며 즐기는 신선한 부산 회는 필수 코스입니다",
          transportMode: "walking",
          transportDuration: 15,
          transportDistance: 1.0,
          transportDetails: null,
          transportCost: null
        },
        {
          time: "16:00",
          activity: "해운대 블루라인파크 스카이캡슐",
          location: "부산광역시 해운대구 청사포로",
          description: "해안 절경을 감상하며 이동하는 스카이캡슐",
          estimatedCost: "₩35,000",
          isEvent: false,
          eventType: null,
          eventId: null,
          rating: null,
          googleMapsUrl: "https://maps.google.com/?q=35.163789,129.186543",
          priceRange: "$$",
          imageUrl: "https://example.com/sky-capsule.jpg",
          recommendationReason: "인스타그램에서 핫한 부산의 새로운 명소! 해안선을 따라 달리는 특별한 경험",
          transportMode: "transit",
          transportDuration: 20,
          transportDistance: 3.5,
          transportDetails: "해운대역 → 청사포역",
          transportCost: "₩1,400"
        }
      ]
    },
    {
      day: 2,
      title: "감천문화마을 & 자갈치",
      activities: [
        {
          time: "09:30",
          activity: "감천문화마을",
          location: "부산광역시 사하구 감내2로 203",
          description: "알록달록 색채의 마을에서 예술 산책",
          estimatedCost: "₩5,000",
          isEvent: false,
          eventType: null,
          eventId: null,
          rating: null,
          googleMapsUrl: "https://maps.google.com/?q=35.097456,129.010789",
          priceRange: "$",
          imageUrl: "https://example.com/gamcheon.jpg",
          recommendationReason: "한국의 마추픽추로 불리는 감천문화마을에서 인생샷을 남겨보세요",
          transportMode: null,
          transportDuration: null,
          transportDistance: null,
          transportDetails: null,
          transportCost: null
        },
        {
          time: "12:30",
          activity: "자갈치시장",
          location: "부산광역시 중구 자갈치해안로 52",
          description: "한국 최대 수산시장에서 해산물 점심",
          estimatedCost: "₩30,000 - ₩50,000",
          isEvent: false,
          eventType: null,
          eventId: null,
          rating: null,
          googleMapsUrl: "https://maps.google.com/?q=35.096789,129.030456",
          priceRange: "$$",
          imageUrl: "https://example.com/jagalchi.jpg",
          recommendationReason: "오이소 보이소 사이소! 부산 대표 수산시장에서 신선한 해산물을 맛보세요",
          transportMode: "transit",
          transportDuration: 25,
          transportDistance: 4.2,
          transportDetails: "감천문화마을 → 자갈치역 (1호선)",
          transportCost: "₩1,400"
        },
        {
          time: "15:00",
          activity: "BIFF 광장 & 국제시장",
          location: "부산광역시 중구 구덕로",
          description: "부산 영화제 거리와 전통시장 탐방",
          estimatedCost: "₩10,000 - ₩20,000",
          isEvent: false,
          eventType: null,
          eventId: null,
          rating: null,
          googleMapsUrl: "https://maps.google.com/?q=35.100123,129.028456",
          priceRange: "$",
          imageUrl: "https://example.com/biff.jpg",
          recommendationReason: "씨앗호떡의 원조! 부산국제영화제의 명소에서 간식도 즐겨보세요",
          transportMode: "walking",
          transportDuration: 10,
          transportDistance: 0.6,
          transportDetails: null,
          transportCost: null
        },
        {
          time: "18:30",
          activity: "광안리 해변",
          location: "부산광역시 수영구 광안해변로",
          description: "광안대교 야경을 보며 저녁 식사",
          estimatedCost: "₩25,000 - ₩40,000",
          isEvent: false,
          eventType: null,
          eventId: null,
          rating: null,
          googleMapsUrl: "https://maps.google.com/?q=35.153234,129.118567",
          priceRange: "$$",
          imageUrl: "https://example.com/gwangalli.jpg",
          recommendationReason: "광안대교의 아름다운 야경과 함께 로맨틱한 저녁을 보내세요",
          transportMode: "transit",
          transportDuration: 30,
          transportDistance: 6.8,
          transportDetails: "자갈치역 → 광안역 (2호선)",
          transportCost: "₩1,400"
        }
      ]
    }
    // Day 3-5 can be added similarly...
  ]
};

// ===== Mock Trip 3: 제주도 자연 힐링 7일 =====
export const mockTrip3: MockTripData = {
  id: "trip-003",
  title: "제주도 자연 힐링 7일",
  duration: "7 days",
  interests: ["nature", "wellness", "food"],
  budget: "luxury",
  status: "upcoming",
  startDate: "2025-04-10",
  endDate: "2025-04-16",
  confirmedAt: "2025-01-02T16:45:00Z",
  cities: ["Jeju Island"],
  daysCount: 7,
  activitiesCount: 28,
  totalEstimatedCost: "₩2,500,000 - ₩3,500,000",
  averageRating: null,
  ratings: [],
  travelTips: [
    "렌터카가 필수입니다 - 대중교통이 불편합니다",
    "날씨가 변덕스러우니 우산을 항상 챙기세요",
    "성수기(7-8월)에는 숙소와 렌터카 예약을 서둘러야 합니다"
  ],
  warnings: [],
  days: [
    {
      day: 1,
      title: "제주 동부 - 성산일출봉 & 우도",
      activities: [
        {
          time: "06:00",
          activity: "성산일출봉 일출 감상",
          location: "제주특별자치도 서귀포시 성산읍 성산리",
          description: "UNESCO 세계자연유산에서 감동의 일출 체험",
          estimatedCost: "₩5,000",
          isEvent: false,
          eventType: null,
          eventId: null,
          rating: null,
          googleMapsUrl: "https://maps.google.com/?q=33.458789,126.942456",
          priceRange: "$",
          imageUrl: "https://example.com/seongsan.jpg",
          recommendationReason: "제주 여행의 하이라이트! 세계자연유산에서 맞이하는 일출은 잊을 수 없는 경험입니다",
          transportMode: null,
          transportDuration: null,
          transportDistance: null,
          transportDetails: null,
          transportCost: null
        },
        {
          time: "09:00",
          activity: "우도 섬 투어",
          location: "제주특별자치도 제주시 우도면",
          description: "에메랄드빛 바다와 땅콩 아이스크림의 섬",
          estimatedCost: "₩15,000 - ₩25,000",
          isEvent: false,
          eventType: null,
          eventId: null,
          rating: null,
          googleMapsUrl: "https://maps.google.com/?q=33.500123,126.970456",
          priceRange: "$",
          imageUrl: "https://example.com/udo.jpg",
          recommendationReason: "제주 속 작은 제주! 전기차나 스쿠터로 섬 한바퀴를 돌아보세요",
          transportMode: "driving",
          transportDuration: 20,
          transportDistance: 5.0,
          transportDetails: "성산포항 → 우도 페리 (15분)",
          transportCost: "₩8,500"
        },
        {
          time: "13:00",
          activity: "해녀의 부엌",
          location: "제주특별자치도 제주시 구좌읍",
          description: "진짜 해녀가 직접 잡은 해산물로 만든 점심",
          estimatedCost: "₩50,000 - ₩80,000",
          isEvent: false,
          eventType: null,
          eventId: null,
          rating: null,
          googleMapsUrl: "https://maps.google.com/?q=33.523456,126.854789",
          priceRange: "$$$",
          imageUrl: "https://example.com/haenyeo.jpg",
          recommendationReason: "제주 해녀 문화를 체험하며 가장 신선한 해산물을 맛볼 수 있는 특별한 곳",
          transportMode: "driving",
          transportDuration: 30,
          transportDistance: 15.0,
          transportDetails: "렌터카 이용",
          transportCost: null
        },
        {
          time: "16:00",
          activity: "월정리 해변",
          location: "제주특별자치도 제주시 구좌읍 월정리",
          description: "에메랄드빛 바다와 감성 카페가 있는 해변",
          estimatedCost: "₩10,000 - ₩20,000",
          isEvent: false,
          eventType: null,
          eventId: null,
          rating: null,
          googleMapsUrl: "https://maps.google.com/?q=33.556789,126.796543",
          priceRange: "$$",
          imageUrl: "https://example.com/woljeong.jpg",
          recommendationReason: "인스타그램에서 유명한 에메랄드빛 바다와 감성 카페 거리",
          transportMode: "driving",
          transportDuration: 15,
          transportDistance: 8.0,
          transportDetails: "렌터카 이용",
          transportCost: null
        }
      ]
    },
    {
      day: 2,
      title: "제주 서부 - 협재 & 오설록",
      activities: [
        {
          time: "09:00",
          activity: "협재해수욕장",
          location: "제주특별자치도 제주시 한림읍 협재리",
          description: "제주에서 가장 아름다운 백사장",
          estimatedCost: "무료",
          isEvent: false,
          eventType: null,
          eventId: null,
          rating: null,
          googleMapsUrl: "https://maps.google.com/?q=33.394567,126.239876",
          priceRange: "무료",
          imageUrl: "https://example.com/hyeopjae.jpg",
          recommendationReason: "비양도를 배경으로 한 에메랄드빛 바다가 인상적인 제주 최고의 해변",
          transportMode: null,
          transportDuration: null,
          transportDistance: null,
          transportDetails: null,
          transportCost: null
        },
        {
          time: "11:30",
          activity: "오설록 티 뮤지엄",
          location: "제주특별자치도 서귀포시 안덕면 신화역사로",
          description: "녹차밭과 프리미엄 녹차 티 체험",
          estimatedCost: "₩15,000 - ₩30,000",
          isEvent: false,
          eventType: null,
          eventId: null,
          rating: null,
          googleMapsUrl: "https://maps.google.com/?q=33.305678,126.289012",
          priceRange: "$$",
          imageUrl: "https://example.com/osulloc.jpg",
          recommendationReason: "초록 녹차밭 사이에서 즐기는 프리미엄 녹차와 녹차 디저트",
          transportMode: "driving",
          transportDuration: 25,
          transportDistance: 12.0,
          transportDetails: "렌터카 이용",
          transportCost: null
        },
        {
          time: "14:00",
          activity: "새별오름",
          location: "제주특별자치도 제주시 애월읍 봉성리",
          description: "360도 제주 파노라마를 볼 수 있는 오름",
          estimatedCost: "무료",
          isEvent: false,
          eventType: null,
          eventId: null,
          rating: null,
          googleMapsUrl: "https://maps.google.com/?q=33.363456,126.358901",
          priceRange: "무료",
          imageUrl: "https://example.com/saebyeol.jpg",
          recommendationReason: "가벼운 트레킹으로 제주의 대자연을 한눈에 담을 수 있는 인기 오름",
          transportMode: "driving",
          transportDuration: 20,
          transportDistance: 10.0,
          transportDetails: "렌터카 이용",
          transportCost: null
        },
        {
          time: "18:00",
          activity: "애월 해안도로 카페거리",
          location: "제주특별자치도 제주시 애월읍",
          description: "바다를 바라보며 즐기는 선셋 카페",
          estimatedCost: "₩15,000 - ₩25,000",
          isEvent: false,
          eventType: null,
          eventId: null,
          rating: null,
          googleMapsUrl: "https://maps.google.com/?q=33.463789,126.312456",
          priceRange: "$$",
          imageUrl: "https://example.com/aewol-cafe.jpg",
          recommendationReason: "제주의 낭만적인 선셋과 함께 여유로운 카페 타임을 즐겨보세요",
          transportMode: "driving",
          transportDuration: 25,
          transportDistance: 15.0,
          transportDetails: "렌터카 이용",
          transportCost: null
        }
      ]
    }
    // Day 3-7 can be added similarly...
  ]
};

// Export all mock trips
export const mockTrips: MockTripData[] = [mockTrip1, mockTrip2, mockTrip3];

export default mockTrips;
