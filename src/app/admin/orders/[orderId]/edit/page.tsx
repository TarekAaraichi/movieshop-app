import { Card } from '@/components/ui/card';
import { PageWrapper } from '@/components/PageThemeContext';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { SaveButton } from '@/components/SaveButton';

export default function EditOrderPage() {
  // TODO: Fetch order data by orderId and handle form state
  return (
    <PageWrapper>
      <div className="mx-auto max-w-2xl space-y-10">
        <Card className="rounded-2xl border border-border bg-card p-6 text-foreground shadow-sm">
          <h1 className="text-2xl font-bold text-foreground">Edit Order</h1>
          <Form>
            <form className="space-y-6">
              <FormField name="status">
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <FormControl>
                    <Input className="bg-card" placeholder="Order status" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>
              <FormField name="tracking">
                <FormItem>
                  <FormLabel>Tracking Number</FormLabel>
                  <FormControl>
                    <Input className="bg-card" placeholder="Tracking number" />
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
