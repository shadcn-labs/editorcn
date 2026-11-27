import { useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";

export const REGISTRY_BASES = [
  { label: "Base UI", short: "Base", value: "base" },
  { label: "Radix UI", short: "Radix", value: "radix" },
] as const;

export type RegistryBase = (typeof REGISTRY_BASES)[number]["value"];

const registryBaseAtom = atomWithStorage<RegistryBase>("registry-base", "base");

export const useRegistryBase = () => useAtom(registryBaseAtom);

const REGISTRY_ITEM_URL =
  /(https:\/\/www\.rtecn\.space\/r)\/(?:styles\/(?:base|radix)-nova\/)?([\w-]+\.json)/g;

export const hasRegistryItemUrl = (command: string) =>
  new RegExp(REGISTRY_ITEM_URL.source).test(command);

export const withRegistryBase = (command: string, base: RegistryBase) =>
  command.replace(REGISTRY_ITEM_URL, `$1/styles/${base}-nova/$2`);
