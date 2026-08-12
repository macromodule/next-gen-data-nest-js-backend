import { relations } from 'drizzle-orm';
import { users } from './users.schema';
import { posts } from './posts.schema';

export * from './users.schema';
export * from './posts.schema';

export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
}));

export const postsRelations = relations(posts, ({ one }) => ({
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id],
  }),
}));
