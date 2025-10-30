import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

function Stat({ title, value }: { title: string; value: string | number }) {
  return (
    <Card>
      <CardHeader className="pb-0">
        <CardTitle className="text-sm text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-2 text-xl font-semibold">{value}</CardContent>
    </Card>
  );
}

export default Stat;
