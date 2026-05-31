import * as v from 'valibot';

// small form, only strings
export const logInSchema = v.object({
  username: v.pipe(v.string(), v.email()),
  password: v.pipe(v.string(), v.minLength(8)),
});

// moderate form, different types
export const signUpSchema = v.object({
  firstName: v.string(),
  lastName: v.string(),
  age: v.number(),
  agreeToTerms: v.boolean(),
  email: v.pipe(v.string(), v.email()),
  password: v.pipe(v.string(), v.minLength(8)),
  questions: v.array(v.object({
    question: v.string(),
    answer: v.string(),
  })),
  address: v.object({
    street: v.string(),
    city: v.string(),
    state: v.string(),
    zip: v.string(),
  }),
});
