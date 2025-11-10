import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface BroadcastDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBroadcastCreated: () => void;
  leadsCount: {
    all: number;
    new: number;
    contact: number;
    deal: number;
    payment: number;
  };
}

const BroadcastDialog = ({ open, onOpenChange, onBroadcastCreated, leadsCount }: BroadcastDialogProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    message: '',
    target_segment: 'all'
  });

  const getTargetCount = () => {
    switch (formData.target_segment) {
      case 'new': return leadsCount.new;
      case 'contact': return leadsCount.contact;
      case 'deal': return leadsCount.deal;
      case 'payment': return leadsCount.payment;
      default: return leadsCount.all;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.message.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Заполните название и текст сообщения',
        variant: 'destructive'
      });
      return;
    }

    if (getTargetCount() === 0) {
      toast({
        title: 'Ошибка',
        description: 'Нет получателей для выбранного сегмента',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('https://functions.poehali.dev/98dbf58f-589d-4436-8971-359923e1a85f', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Failed to create broadcast');

      toast({
        title: 'Рассылка создана! 🚀',
        description: `Будет отправлена ${getTargetCount()} получателям`
      });

      setFormData({
        name: '',
        message: '',
        target_segment: 'all'
      });

      onBroadcastCreated();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось создать рассылку',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <span>💬</span> Создать рассылку
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Название рассылки *</Label>
              <Input
                id="name"
                placeholder="Специальное предложение"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-slate-800 border-slate-700"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="target_segment">Получатели</Label>
              <Select 
                value={formData.target_segment} 
                onValueChange={(value) => setFormData({ ...formData, target_segment: value })}
              >
                <SelectTrigger className="bg-slate-800 border-slate-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="all">
                    <div className="flex items-center justify-between w-full">
                      <span>Все лиды</span>
                      <Badge variant="secondary" className="ml-2">{leadsCount.all}</Badge>
                    </div>
                  </SelectItem>
                  <SelectItem value="new">
                    <div className="flex items-center justify-between w-full">
                      <span>📥 Новые</span>
                      <Badge variant="secondary" className="ml-2">{leadsCount.new}</Badge>
                    </div>
                  </SelectItem>
                  <SelectItem value="contact">
                    <div className="flex items-center justify-between w-full">
                      <span>💬 Контакт</span>
                      <Badge variant="secondary" className="ml-2">{leadsCount.contact}</Badge>
                    </div>
                  </SelectItem>
                  <SelectItem value="deal">
                    <div className="flex items-center justify-between w-full">
                      <span>🤝 Сделка</span>
                      <Badge variant="secondary" className="ml-2">{leadsCount.deal}</Badge>
                    </div>
                  </SelectItem>
                  <SelectItem value="payment">
                    <div className="flex items-center justify-between w-full">
                      <span>💳 Оплата</span>
                      <Badge variant="secondary" className="ml-2">{leadsCount.payment}</Badge>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-400">
                Будет отправлено: {getTargetCount()} получателям
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Текст сообщения *</Label>
              <Textarea
                id="message"
                placeholder="Привет! 👋 У нас для тебя специальное предложение..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="bg-slate-800 border-slate-700 min-h-[150px]"
                required
              />
              <p className="text-xs text-slate-400">
                Символов: {formData.message.length} / 4096
              </p>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <Icon name="Info" size={16} className="text-blue-400 mt-0.5" />
                <div className="text-xs text-blue-300">
                  <p className="font-medium mb-1">Рекомендации:</p>
                  <ul className="space-y-1 text-blue-200/80">
                    <li>• Персонализируйте сообщения</li>
                    <li>• Добавьте призыв к действию</li>
                    <li>• Учитывайте лимиты Telegram</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-slate-700"
            >
              Отмена
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700"
              disabled={isSubmitting || getTargetCount() === 0}
            >
              {isSubmitting ? (
                <>
                  <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                  Создание...
                </>
              ) : (
                <>
                  <Icon name="Send" size={16} className="mr-2" />
                  Создать рассылку
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BroadcastDialog;