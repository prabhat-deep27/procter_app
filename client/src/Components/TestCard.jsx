import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TestCard() {
  return (
    <Card className="w-full lg:w-72 flex flex-col justify-between shadow-lg border-0">
      <CardHeader>
        <CardTitle className="text-cyan-600">Create New Test</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600">
          Write a new test: Biology and others
        </p>
      </CardContent>
    </Card>
  );
}
