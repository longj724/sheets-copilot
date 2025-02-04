// External Dependencies
import { relations } from "drizzle-orm";
import {
  pgTable,
  timestamp,
  text,
} from "drizzle-orm/pg-core";


export const projects = pgTable("project", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  userId: text("userId").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const projectsRelations = relations(projects, ({ many }) => ({
  spreadsheets: many(projectSpreadsheets),
}));

export const projectSpreadsheets = pgTable('project_spreadsheets', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  projectId: text('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  spreadsheetId: text('spreadsheet_id').notNull(),
  spreadsheetName: text('spreadsheet_name').notNull(),
  accessToken: text('access_token').notNull(),
  refreshToken: text('refresh_token'),
  tokenExpiryDate: timestamp('token_expiry_date'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const projectSpreadsheetsRelations = relations(projectSpreadsheets, ({ one }) => ({
  project: one(projects, {
    fields: [projectSpreadsheets.projectId],
    references: [projects.id],
  }),
}));
