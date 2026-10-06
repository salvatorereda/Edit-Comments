import patioSnapshot from './assets/patio-snapshot.png';
import storefrontPhoto from './assets/storefront-photo.png';

export const PATIO_SNAPSHOT = patioSnapshot;
export const STOREFRONT_PHOTO = storefrontPhoto;

// Real AvatarBubble color pairs, from Collaboration/CollaborationStatusBar.stories.mdx.
export const USERS = {
  maya: {
    id: 'user-maya',
    name: 'Maya Sanchez',
    mainColor: '#55507A',
    outlineColor: '#8387A5',
  },
  nora: {
    id: 'user-nora',
    name: 'Nora Mills',
    mainColor: '#F1A24D',
    outlineColor: '#F7D36B',
  },
  glen: {
    id: 'user-glen',
    name: 'Glen Sato',
    mainColor: '#924B4F',
    outlineColor: '#E4B7B8',
  },
};

// The person viewing the thread. Only their own replies can be edited or
// deleted, the same rule source uses for delete (wasAuthoredByCurrentUser).
export const CURRENT_USER = USERS.maya;

export const TOPIC = {
  id: 'topic',
  author: USERS.nora,
  createdAt: '2026-08-23T09:00:00',
  text: 'Can we push the patio umbrellas back about 2 feet? They block the walkway when they are open.',
  snapshot: PATIO_SNAPSHOT,
  reactions: [],
};

export const REPLIES = [
  {
    id: 'reply-glen',
    author: USERS.glen,
    createdAt: '2026-08-23T09:12:00',
    text: 'Agreed. Moving them also clears the sight line from the storefront.',
    image: null,
    reactions: [
      { character: '😀', authorName: USERS.maya.name },
      ...Array.from({ length: 8 }, (_v, i) => ({
        character: '👍',
        authorName: i === 0 ? USERS.nora.name : `Reviewer ${i}`,
      })),
    ],
  },
];

// What Maya types in the Figma "Writes comment" frame.
export const MAYA_DRAFT_TEXT =
  '👍 Here is the storefront with the new awning. Reference: https://www.modernhomesportland.com/project/rummer-homes/ Does the awning depth read right from the patio?';

export const MAYA_REPLY = {
  id: 'reply-maya',
  author: USERS.maya,
  createdAt: '2026-08-23T09:30:00',
  text: MAYA_DRAFT_TEXT,
  image: STOREFRONT_PHOTO,
  reactions: [],
};
