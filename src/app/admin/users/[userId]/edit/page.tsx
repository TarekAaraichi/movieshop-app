import { Card } from '@/components/ui/card';
import { PageWrapper } from '@/components/PageThemeContext';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { SaveButton } from '@/components/SaveButton';

export default function EditUserPage() {
  // TODO: Fetch user data by userId and handle form state
  return (
    <PageWrapper>
      <div className="mx-auto max-w-2xl space-y-10">
        <Card className="rounded-2xl border border-border bg-card p-6 text-foreground shadow-sm">
          <h1 className="text-2xl font-bold text-foreground">Edit User</h1>
          <Form>
            <form className="space-y-6">
              <FormField name="name">
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input className="bg-card" placeholder="User name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>
              <FormField name="email">
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input className="bg-card" placeholder="user@email.com" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>
              {/* Add more fields as needed */}
              <div className="flex justify-end pt-6">
                <SaveButton buttonText="Save Changes" type="submit" />
              </div>
            </form>
          </Form>
        </Card>
      </div>
    </PageWrapper>
  );
}
