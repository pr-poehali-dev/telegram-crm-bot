import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';

interface Lead {
  id: number;
  name: string;
  username: string;
  stage: 'new' | 'contact' | 'deal' | 'payment' | 'done';
  value: number;
  lastContact: string;
  notes: string;
}

const STAGES = {
  new: { label: 'Новый', color: 'bg-blue-500', emoji: '📥' },
  contact: { label: 'Контакт', color: 'bg-purple-500', emoji: '💬' },
  deal: { label: 'Сделка', color: 'bg-orange-500', emoji: '🤝' },
  payment: { label: 'Оплата', color: 'bg-green-500', emoji: '💳' },
  done: { label: 'Завершено', color: 'bg-gray-500', emoji: '✅' }
};

const INITIAL_LEADS: Lead[] = [
  { id: 1, name: 'Алексей Иванов', username: '@alexivanov', stage: 'new', value: 50000, lastContact: '2 часа назад', notes: 'Интересуется корп. тарифом' },
  { id: 2, name: 'Мария Петрова', username: '@mariap', stage: 'contact', value: 35000, lastContact: '1 день назад', notes: 'Запросила демо' },
  { id: 3, name: 'Игорь Сидоров', username: '@igorsid', stage: 'deal', value: 75000, lastContact: '3 часа назад', notes: 'Готов к оплате' },
  { id: 4, name: 'Ольга Смирнова', username: '@olgasm', stage: 'payment', value: 45000, lastContact: '30 мин назад', notes: 'Ждем счет' },
  { id: 5, name: 'Дмитрий Козлов', username: '@dmitryk', stage: 'new', value: 28000, lastContact: '5 часов назад', notes: 'Первый контакт' },
  { id: 6, name: 'Елена Волкова', username: '@elenav', stage: 'done', value: 60000, lastContact: '2 дня назад', notes: 'Оплачено, доволен' }
];

const Dashboard = () => {
  const [leads, setLeads] = useState<Lead[]>(INITIAL_LEADS);
  const [activeTab, setActiveTab] = useState('pipeline');

  const getLeadsByStage = (stage: Lead['stage']) => leads.filter(l => l.stage === stage);
  
  const totalValue = leads.reduce((sum, lead) => sum + lead.value, 0);
  const conversionRate = Math.round((getLeadsByStage('done').length / leads.length) * 100);

  const moveLeadToStage = (leadId: number, newStage: Lead['stage']) => {
    setLeads(leads.map(lead => 
      lead.id === leadId ? { ...lead, stage: newStage } : lead
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="container mx-auto p-4 md:p-6 max-w-7xl">
        <header className="mb-8 animate-fade-in">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center gap-3">
                <span className="text-4xl">🚀</span> LeadPilot CRM
              </h1>
              <p className="text-slate-400">Управление продажами в Telegram</p>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Icon name="Plus" size={18} className="mr-2" />
              Добавить лид
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-5 bg-slate-800/50 border-slate-700 hover-scale backdrop-blur-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-400 text-sm">Всего лидов</span>
                <span className="text-2xl">📇</span>
              </div>
              <div className="text-3xl font-bold text-white">{leads.length}</div>
            </Card>

            <Card className="p-5 bg-slate-800/50 border-slate-700 hover-scale backdrop-blur-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-400 text-sm">Конверсия</span>
                <span className="text-2xl">📈</span>
              </div>
              <div className="text-3xl font-bold text-green-400">{conversionRate}%</div>
            </Card>

            <Card className="p-5 bg-slate-800/50 border-slate-700 hover-scale backdrop-blur-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-400 text-sm">Сумма сделок</span>
                <span className="text-2xl">💰</span>
              </div>
              <div className="text-3xl font-bold text-blue-400">
                {(totalValue / 1000).toFixed(0)}к ₽
              </div>
            </Card>

            <Card className="p-5 bg-slate-800/50 border-slate-700 hover-scale backdrop-blur-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-400 text-sm">Активных</span>
                <span className="text-2xl">⚡</span>
              </div>
              <div className="text-3xl font-bold text-orange-400">
                {leads.filter(l => l.stage !== 'done').length}
              </div>
            </Card>
          </div>
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="animate-fade-in">
          <TabsList className="bg-slate-800/50 border border-slate-700 mb-6">
            <TabsTrigger value="pipeline" className="data-[state=active]:bg-slate-700">
              <Icon name="GitBranch" size={16} className="mr-2" />
              Воронка
            </TabsTrigger>
            <TabsTrigger value="broadcast" className="data-[state=active]:bg-slate-700">
              <Icon name="Send" size={16} className="mr-2" />
              Рассылки
            </TabsTrigger>
            <TabsTrigger value="team" className="data-[state=active]:bg-slate-700">
              <Icon name="Users" size={16} className="mr-2" />
              Команда
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-slate-700">
              <Icon name="BarChart3" size={16} className="mr-2" />
              Аналитика
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pipeline" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {Object.entries(STAGES).map(([stageKey, stageData]) => {
                const stageLeads = getLeadsByStage(stageKey as Lead['stage']);
                const stageValue = stageLeads.reduce((sum, lead) => sum + lead.value, 0);
                
                return (
                  <div key={stageKey} className="animate-scale-in">
                    <div className="mb-3">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">{stageData.emoji}</span>
                        <h3 className="font-semibold text-white">{stageData.label}</h3>
                        <Badge variant="secondary" className="ml-auto">{stageLeads.length}</Badge>
                      </div>
                      <div className="text-sm text-slate-400">
                        {(stageValue / 1000).toFixed(0)}к ₽
                      </div>
                    </div>

                    <div className="space-y-3">
                      {stageLeads.map((lead, index) => (
                        <Card 
                          key={lead.id}
                          className="p-4 bg-slate-800/50 border-slate-700 hover:bg-slate-800 cursor-pointer transition-all hover-scale"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <div className="flex items-start gap-3 mb-3">
                            <Avatar className="w-10 h-10">
                              <AvatarFallback className="bg-blue-600 text-white text-sm">
                                {lead.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-white text-sm truncate">{lead.name}</div>
                              <div className="text-xs text-slate-400">{lead.username}</div>
                            </div>
                          </div>

                          <div className="text-lg font-bold text-white mb-2">
                            {lead.value.toLocaleString()} ₽
                          </div>

                          <div className="text-xs text-slate-400 mb-3">
                            <Icon name="Clock" size={12} className="inline mr-1" />
                            {lead.lastContact}
                          </div>

                          <p className="text-xs text-slate-300 mb-3 line-clamp-2">{lead.notes}</p>

                          <div className="flex gap-1">
                            {stageKey !== 'new' && (
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="h-7 px-2 text-xs"
                                onClick={() => {
                                  const stages = Object.keys(STAGES);
                                  const currentIndex = stages.indexOf(stageKey);
                                  if (currentIndex > 0) {
                                    moveLeadToStage(lead.id, stages[currentIndex - 1] as Lead['stage']);
                                  }
                                }}
                              >
                                <Icon name="ChevronLeft" size={14} />
                              </Button>
                            )}
                            {stageKey !== 'done' && (
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="h-7 px-2 text-xs ml-auto"
                                onClick={() => {
                                  const stages = Object.keys(STAGES);
                                  const currentIndex = stages.indexOf(stageKey);
                                  if (currentIndex < stages.length - 1) {
                                    moveLeadToStage(lead.id, stages[currentIndex + 1] as Lead['stage']);
                                  }
                                }}
                              >
                                <Icon name="ChevronRight" size={14} />
                              </Button>
                            )}
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="broadcast" className="space-y-4">
            <Card className="p-6 bg-slate-800/50 border-slate-700">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <span>💬</span> Создать рассылку
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-slate-400 mb-2 block">Получатели</label>
                  <div className="flex gap-2 flex-wrap">
                    <Badge className="bg-blue-600 hover:bg-blue-700 cursor-pointer">Все ({leads.length})</Badge>
                    <Badge variant="outline" className="cursor-pointer">Новые ({getLeadsByStage('new').length})</Badge>
                    <Badge variant="outline" className="cursor-pointer">В работе ({getLeadsByStage('contact').length})</Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-slate-400 mb-2 block">Сообщение</label>
                  <textarea 
                    className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg text-white min-h-[120px]"
                    placeholder="Привет! 👋 У нас для тебя специальное предложение..."
                  />
                </div>
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  <Icon name="Send" size={18} className="mr-2" />
                  Отправить рассылку
                </Button>
              </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-5 bg-slate-800/50 border-slate-700">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-slate-400">Отправлено сегодня</span>
                  <span className="text-2xl">📨</span>
                </div>
                <div className="text-2xl font-bold text-white mb-2">247</div>
                <Progress value={65} className="h-2" />
              </Card>

              <Card className="p-5 bg-slate-800/50 border-slate-700">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-slate-400">Открыли</span>
                  <span className="text-2xl">👀</span>
                </div>
                <div className="text-2xl font-bold text-green-400 mb-2">182</div>
                <Progress value={74} className="h-2" />
              </Card>

              <Card className="p-5 bg-slate-800/50 border-slate-700">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-slate-400">Ответили</span>
                  <span className="text-2xl">💬</span>
                </div>
                <div className="text-2xl font-bold text-blue-400 mb-2">43</div>
                <Progress value={24} className="h-2" />
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="team" className="space-y-4">
            <Card className="p-6 bg-slate-800/50 border-slate-700">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                  <span>👥</span> Команда
                </h3>
                <Button variant="outline" size="sm">
                  <Icon name="UserPlus" size={16} className="mr-2" />
                  Пригласить
                </Button>
              </div>

              <div className="space-y-3">
                {[
                  { name: 'Анна Ковалева', role: 'Админ', leads: 15, deals: '280к ₽', status: 'online' },
                  { name: 'Сергей Морозов', role: 'Менеджер', leads: 12, deals: '195к ₽', status: 'online' },
                  { name: 'Татьяна Белова', role: 'Менеджер', leads: 8, deals: '142к ₽', status: 'offline' }
                ].map((member, i) => (
                  <Card key={i} className="p-4 bg-slate-900/50 border-slate-700 flex items-center gap-4">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback className="bg-purple-600 text-white">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-white">{member.name}</span>
                        <div className={`w-2 h-2 rounded-full ${member.status === 'online' ? 'bg-green-500' : 'bg-slate-600'}`} />
                      </div>
                      <div className="text-sm text-slate-400">{member.role}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-white">{member.leads} лидов</div>
                      <div className="text-xs text-slate-400">{member.deals}</div>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-6 bg-slate-800/50 border-slate-700">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <span>📊</span> Конверсия по этапам
                </h3>
                <div className="space-y-4">
                  {Object.entries(STAGES).map(([key, stage]) => {
                    const count = getLeadsByStage(key as Lead['stage']).length;
                    const percentage = Math.round((count / leads.length) * 100);
                    
                    return (
                      <div key={key}>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-slate-300">{stage.emoji} {stage.label}</span>
                          <span className="text-white font-medium">{count} ({percentage}%)</span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              </Card>

              <Card className="p-6 bg-slate-800/50 border-slate-700">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <span>💰</span> Сумма по этапам
                </h3>
                <div className="space-y-4">
                  {Object.entries(STAGES).map(([key, stage]) => {
                    const stageLeads = getLeadsByStage(key as Lead['stage']);
                    const value = stageLeads.reduce((sum, lead) => sum + lead.value, 0);
                    const percentage = Math.round((value / totalValue) * 100);
                    
                    return (
                      <div key={key}>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-slate-300">{stage.emoji} {stage.label}</span>
                          <span className="text-white font-medium">{(value / 1000).toFixed(0)}к ₽ ({percentage}%)</span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>

            <Card className="p-6 bg-slate-800/50 border-slate-700">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <span>⚡</span> Активность за неделю
              </h3>
              <div className="grid grid-cols-7 gap-2">
                {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((day, i) => (
                  <div key={i} className="text-center">
                    <div className="text-xs text-slate-400 mb-2">{day}</div>
                    <div className="bg-slate-700 rounded-lg p-3 hover:bg-blue-600 transition-colors cursor-pointer">
                      <div className="text-lg font-bold text-white">{Math.floor(Math.random() * 20 + 10)}</div>
                      <div className="text-xs text-slate-400">лидов</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
