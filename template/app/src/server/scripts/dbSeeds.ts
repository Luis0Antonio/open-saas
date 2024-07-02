import { type User } from 'wasp/entities';
import { faker } from '@faker-js/faker';
import type { PrismaClient } from '@prisma/client';
import { PaymentPlanIds } from '../../shared/constants.js';
import { type SubscriptionStatusOptions } from '../../shared/types.js';

type MockUserData = Omit<User, 'id'>;

/**
 * This function, which we've imported in `app.db.seeds` in the `main.wasp` file,
 * seeds the database with mock users via the `wasp db seed` command.
 * For more info see: https://wasp-lang.dev/docs/data-model/backends#seeding-the-database
 */
export async function seedMockUsers(prismaClient: PrismaClient) {
  await Promise.all(generateMockUsersData(50).map((data) => 
    prismaClient.user.create({ data }))
  );
}

function generateMockUsersData(numOfUsers: number): MockUserData[] {
  return faker.helpers.multiple(generateMockUserData, { count: numOfUsers });
}

function generateMockUserData(): MockUserData {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const subscriptionStatus = faker.helpers.arrayElement<SubscriptionStatusOptions>(['active', 'canceled', 'past_due', 'deleted', null]);
  const now = new Date();
  const createdAt = faker.date.past({ refDate: now });
  const lastActiveTimestamp = faker.date.between({ from: createdAt, to: now });
  const credits = subscriptionStatus ? 0 : faker.number.int({ min: 0, max: 10 });
  const hasUserPaidOnStripe = !!subscriptionStatus || credits > 3 
  return {
    email: faker.internet.email({ firstName, lastName }),
    username: faker.internet.userName({ firstName, lastName }),
    createdAt,
    lastActiveTimestamp,
    isAdmin: false,
    sendEmail: false,
    credits,
    subscriptionStatus,
    stripeId: hasUserPaidOnStripe ? `cus_test_${faker.string.uuid()}` : null,
    datePaid: hasUserPaidOnStripe ? faker.date.between({ from: createdAt, to: lastActiveTimestamp }) : null,
    checkoutSessionId: hasUserPaidOnStripe ? `cs_test_${faker.string.uuid()}` : null,
    subscriptionTier: subscriptionStatus ? faker.helpers.arrayElement([PaymentPlanIds.HOBBY, PaymentPlanIds.PRO]) : null,
  };
}
