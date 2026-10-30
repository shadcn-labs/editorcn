import { track } from "@vercel/analytics";
import { z } from "zod";

const eventSchema = z.object({
  name: z.enum([
    "copy_npm_command",
    "copy_usage_import_code",
    "copy_usage_code",
    "copy_primitive_code",
    "copy_theme_code",
    "copy_block_code",
    "copy_chunk_code",
    "enable_lift_mode",
    "copy_chart_code",
    "copy_chart_theme",
    "copy_chart_data",
    "copy_color",
    "set_layout",
    "open_command_menu",
    "click_edit_page",
    "click_registry_add_button",
    "copy_registry_command",
    "keyboard_shortcut_navigate",
    "click_promo",
    "copy_promo_command",
  ]),
  properties: z
    .record(
      z.string(),
      z.union([z.string(), z.number(), z.boolean(), z.null()])
    )
    .optional(),
});

export type Event = z.infer<typeof eventSchema>;

export const trackEvent = (input: Event): void => {
  const event = eventSchema.parse(input);
  if (event) {
    track(event.name, event.properties);
  }
};
