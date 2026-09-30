import {
  SlashMenu,
  SlashMenuList,
  SlashMenuItem,
  SlashMenuSearch,
  SlashMenuSearchInput,
} from "@editorcn/editor-ui/block-editor";
import type {
  SuggestionKeyDownProps,
  SuggestionProps,
} from "@tiptap/suggestion";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
  useRef,
} from "react";

import { DEFAULT_ICONS } from "../../icons";
import type { SlashCommandSuggestionItem } from "./slash-command";

export type SuggestionListProps = SuggestionProps<
  SlashCommandSuggestionItem,
  unknown
>;

export interface SuggestionListHandle {
  onKeyDown: (props: SuggestionKeyDownProps) => boolean;
}

const SuggestionList = forwardRef<SuggestionListHandle, SuggestionListProps>(
  (props, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [searchQuery, setSearchQuery] = useState("");
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const filteredItems = props.items.filter((item) => {
      const query = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query)
      );
    });

    const selectItem = (index: number) => {
      const item = filteredItems[index];
      if (!item) {
        return;
      }
      props.command(item);
    };

    const upHandler = () => {
      setSelectedIndex(
        (selectedIndex + filteredItems.length - 1) % filteredItems.length
      );
    };

    const downHandler = () => {
      setSelectedIndex((selectedIndex + 1) % filteredItems.length);
    };

    const enterHandler = () => {
      selectItem(selectedIndex);
    };

    // Reset selection when items or search query changes
    const [prevResetKey, setPrevResetKey] = useState({
      count: filteredItems.length,
      query: searchQuery,
    });
    if (
      prevResetKey.count !== filteredItems.length ||
      prevResetKey.query !== searchQuery
    ) {
      setPrevResetKey({
        count: filteredItems.length,
        query: searchQuery,
      });
      setSelectedIndex(0);
    }

    // Ensure the selected item remains visible in the scrollable area
    useEffect(() => {
      if (!scrollContainerRef.current) {
        return;
      }
      const selectedElement = scrollContainerRef.current.children[
        selectedIndex
      ] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      }
    }, [selectedIndex]);

    // Handle keyboard events originating from the Tiptap editor
    useImperativeHandle(ref, () => ({
      onKeyDown: ({ event }) => {
        if (event.key === "ArrowUp") {
          upHandler();
          return true;
        }
        if (event.key === "ArrowDown") {
          downHandler();
          return true;
        }
        if (event.key === "Enter") {
          enterHandler();
          return true;
        }
        return false;
      },
    }));

    return (
      <SlashMenu>
        {/* Search Header */}
        <SlashMenuSearch>
          {DEFAULT_ICONS.searchIcon}
          <SlashMenuSearchInput
            placeholder="Search commands..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            // If the user clicks into the input, let them use arrows/enter here too
            onKeyDown={(e) => {
              if (e.key === "ArrowUp") {
                e.preventDefault();
                upHandler();
              }
              if (e.key === "ArrowDown") {
                e.preventDefault();
                downHandler();
              }
              if (e.key === "Enter") {
                e.preventDefault();
                enterHandler();
              }
            }}
          />
        </SlashMenuSearch>

        {/* Scrollable List */}
        <SlashMenuList ref={scrollContainerRef}>
          {filteredItems.length > 0 ? (
            filteredItems.map((item, i) => (
              <SlashMenuItem
                key={item.title}
                selected={i === selectedIndex}
                onClick={() => selectItem(i)}
                onMouseEnter={() => setSelectedIndex(i)}
              >
                <div className="block-editor-slash-menu-item-icon">
                  {item.icon ?? DEFAULT_ICONS.fallbackIcon}
                </div>
                <div className="block-editor-slash-menu-item-content">
                  <span className="block-editor-slash-menu-item-label">
                    {item.title}
                  </span>
                  {item.description && (
                    <span className="block-editor-slash-menu-item-desc">
                      {item.description}
                    </span>
                  )}
                </div>
              </SlashMenuItem>
            ))
          ) : (
            <div className="block-editor-slash-menu-empty">
              No results for "{searchQuery}"
            </div>
          )}
        </SlashMenuList>
      </SlashMenu>
    );
  }
);

export default SuggestionList;
