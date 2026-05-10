export interface EventItem {
  id: number;
  title: string;
  type: string;
  conditions: string;
  active: boolean;
  impressions: number;
  clicks: number;
  priority: string;
  targetAudience: string;
  budget: number;
  expectedParticipants: number;
  location: string;
  startDate: string;
  endDate: string;
  description: string;
  organizer: string;
  contactEmail: string;
  website: string;
  requirements: string;
  weatherDependency: string;
  ageRestriction: string;
  frequency: number;
  relevance: number;
  imageUrl: string;
}

export const mockEvents: EventItem[] = [
  {
    id: 1,
    title: '벚꽃 축제',
    type: '시즌 이벤트',
    conditions: '봄, 서울, 자연 관심사',
    active: true,
    impressions: 1234,
    clicks: 156,
    priority: '높음',
    targetAudience: '모든 연령',
    budget: 50000,
    expectedParticipants: 1000,
    location: '여의도 공원',
    startDate: '2024-04-01',
    endDate: '2024-04-15',
    description: '서울 여의도에서 열리는 봄 벚꽃 축제로 전통 공연과 먹거리를 즐길 수 있습니다.',
    organizer: '서울시청',
    contactEmail: 'cherry@seoul.go.kr',
    website: 'https://seoul.go.kr/cherry',
    requirements: '사전 예약 필요',
    weatherDependency: '우천시 취소',
    ageRestriction: '없음',
    frequency: 75,
    relevance: 85,
    imageUrl: 'https://images.unsplash.com/photo-1522383225653-ed111181a951?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400'
  },
  {
    id: 2,
    title: 'K-Pop 콘서트 할인',
    type: '프로모션',
    conditions: 'K-Culture 관심사, 서울',
    active: true,
    impressions: 856,
    clicks: 98,
    priority: '중간',
    targetAudience: '10-30대',
    budget: 100000,
    expectedParticipants: 500,
    location: '잠실 올림픽 공원',
    startDate: '2024-05-01',
    endDate: '2024-05-31',
    description: '인기 K-Pop 콘서트 티켓 20% 할인 혜택',
    organizer: 'SM Entertainment',
    contactEmail: 'events@sment.com',
    website: 'https://smtown.com',
    requirements: '멤버십 가입 필요',
    weatherDependency: '실내 공연',
    ageRestriction: '전연령 관람가',
    frequency: 45,
    relevance: 90,
    imageUrl: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400'
  }
];
