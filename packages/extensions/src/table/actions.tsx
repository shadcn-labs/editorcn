"use client";

import type { ChainedCommands } from "@tiptap/core";
import {
  ArrowDownToLine,
  ArrowLeftToLine,
  ArrowRightToLine,
  ArrowUpToLine,
  CheckIcon,
  Grid2x2X,
  PanelTop,
  TableCellsMerge,
  TableCellsSplit,
  Trash2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import type { ExtensionLabelKey, ExtensionLabels } from "../core/labels";
import { DropdownMenuItem } from "../ui/dropdown-item";
import { DropdownMenuSeparator } from "../ui/dropdown-separator";

export type TableCommand = (chain: ChainedCommands) => ChainedCommands;

export type TableActionId =
  | "addColumnLeft"
  | "addColumnRight"
  | "addRowAbove"
  | "addRowBelow"
  | "deleteColumn"
  | "deleteRow"
  | "deleteTable"
  | "headerRow"
  | "mergeCells"
  | "splitCell";

export interface TableAction {
  command: TableCommand;
  danger?: boolean;
  icon: LucideIcon;
  id: TableActionId;
  label: ExtensionLabelKey;
}

export const TABLE_ACTIONS: Record<TableActionId, TableAction> = {
  addColumnLeft: {
    command: (c) => c.addColumnBefore(),
    icon: ArrowLeftToLine,
    id: "addColumnLeft",
    label: "addColumnLeft",
  },
  addColumnRight: {
    command: (c) => c.addColumnAfter(),
    icon: ArrowRightToLine,
    id: "addColumnRight",
    label: "addColumnRight",
  },
  addRowAbove: {
    command: (c) => c.addRowBefore(),
    icon: ArrowUpToLine,
    id: "addRowAbove",
    label: "addRowAbove",
  },
  addRowBelow: {
    command: (c) => c.addRowAfter(),
    icon: ArrowDownToLine,
    id: "addRowBelow",
    label: "addRowBelow",
  },
  deleteColumn: {
    command: (c) => c.deleteColumn(),
    danger: true,
    icon: Trash2,
    id: "deleteColumn",
    label: "deleteColumn",
  },
  deleteRow: {
    command: (c) => c.deleteRow(),
    danger: true,
    icon: Trash2,
    id: "deleteRow",
    label: "deleteRow",
  },
  deleteTable: {
    command: (c) => c.deleteTable(),
    danger: true,
    icon: Grid2x2X,
    id: "deleteTable",
    label: "deleteTable",
  },
  headerRow: {
    command: (c) => c.toggleHeaderRow(),
    icon: PanelTop,
    id: "headerRow",
    label: "headerRow",
  },
  mergeCells: {
    command: (c) => c.mergeCells(),
    icon: TableCellsMerge,
    id: "mergeCells",
    label: "mergeCells",
  },
  splitCell: {
    command: (c) => c.splitCell(),
    icon: TableCellsSplit,
    id: "splitCell",
    label: "splitCell",
  },
};

export const ROW_ACTIONS: TableActionId[][] = [
  ["addRowAbove", "addRowBelow"],
  ["deleteRow"],
];

export const COLUMN_ACTIONS: TableActionId[][] = [
  ["addColumnLeft", "addColumnRight"],
  ["deleteColumn"],
];

export interface TableActionItemsProps {
  checked?: Partial<Record<TableActionId, boolean>>;
  disabled?: Partial<Record<TableActionId, boolean>>;
  groups: TableActionId[][];
  labels: ExtensionLabels;
  onSelect: (action: TableAction) => void;
}

export const TableActionItems = ({
  checked,
  disabled,
  groups,
  labels,
  onSelect,
}: TableActionItemsProps) =>
  groups.map((group, index) => (
    <div key={group.join(",")} className="ext-table-action-group contents">
      {index > 0 && <DropdownMenuSeparator />}
      {group.map((id) => {
        const action = TABLE_ACTIONS[id];
        const Icon = action.icon;
        const isChecked = checked?.[id];
        return (
          <DropdownMenuItem
            key={id}
            role={isChecked === undefined ? "menuitem" : "menuitemcheckbox"}
            aria-checked={isChecked}
            danger={action.danger}
            disabled={disabled?.[id]}
            onClick={() => onSelect(action)}
          >
            <Icon />
            <span className="flex-1">{labels[action.label]}</span>
            {isChecked ? <CheckIcon /> : null}
          </DropdownMenuItem>
        );
      })}
    </div>
  ));
