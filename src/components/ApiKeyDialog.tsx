import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, XCircle, Key, ExternalLink, Loader2 } from "lucide-react";
import { validateApiKey } from "@/lib/gemini";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  apiKey: string;
  onSave: (key: string) => void;
  isValid: boolean | null;
}

export const ApiKeyDialog = ({ open, onOpenChange, apiKey, onSave, isValid }: Props) => {
  const [value, setValue] = useState(apiKey);
  const [checking, setChecking] = useState(false);

  const handleSave = async () => {
    if (!value.trim()) {
      toast.error("Please enter an API key");
      return;
    }
    setChecking(true);
    const ok = await validateApiKey(value.trim());
    setChecking(false);
    if (ok) {
      onSave(value.trim());
      toast.success("API key saved & validated");
      onOpenChange(false);
    } else {
      toast.error("Invalid API key. Please check and try again.");
      onSave(value.trim()); // still save attempt
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5 text-primary" />
            Google Gemini API Key
          </DialogTitle>
          <DialogDescription>
            Your key is stored locally in your browser. Get one from{" "}
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noreferrer"
              className="text-primary underline inline-flex items-center gap-1"
            >
              Google AI Studio <ExternalLink className="h-3 w-3" />
            </a>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <Label htmlFor="apikey">API Key</Label>
          <div className="relative">
            <Input
              id="apikey"
              type="password"
              placeholder="AIza..."
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="pr-10"
            />
            {isValid !== null && apiKey && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {isValid ? (
                  <CheckCircle2 className="h-5 w-5 text-success" />
                ) : (
                  <XCircle className="h-5 w-5 text-destructive" />
                )}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={checking}>
            {checking && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Key
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
