import type { MentionItem } from "@editorcn/extensions/mention";

const avatar = (id: string) =>
  `https://images.unsplash.com/photo-${id}?w=64&h=64&fit=crop&crop=faces`;

export const PEOPLE: MentionItem[] = [
  {
    avatar: avatar("1494790108377-be9c29b29330"),
    description: "Analytics lead",
    id: "1",
    label: "Ada Lovelace",
  },
  {
    avatar: avatar("1500648767791-00dcc994a43e"),
    description: "Security engineer",
    id: "2",
    label: "Alan Turing",
  },
  {
    avatar: avatar("1438761681033-6461ffad8d80"),
    description: "Compiler team",
    id: "3",
    label: "Grace Hopper",
  },
  {
    avatar: avatar("1507003211169-0a1dd7228f2d"),
    description: "Kernel maintainer",
    id: "4",
    label: "Linus Torvalds",
  },
  {
    avatar: avatar("1534528741775-53994a69daeb"),
    description: "Flight software lead",
    id: "5",
    label: "Margaret Hamilton",
  },
];

export const searchPeople = (query: string) =>
  PEOPLE.filter((p) => p.label.toLowerCase().includes(query.toLowerCase()));
