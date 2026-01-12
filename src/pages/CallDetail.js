/**
 * Call Detail Page
 * 
 * Layout: Transcript on left (2/3), Tabs (Summary/Scores) on right (1/3)
 * Same as Gistly project
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCall } from '../services/api';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { ArrowLeft, FileText, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

function CallDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [call, setCall] = useState(null);
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('summary');

  useEffect(() => {
    loadCall();
    const interval = setInterval(() => {
      if (call && (call.status === 'transcribing' || call.status === 'processing')) {
        loadCall();
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [id, call?.status]);

  const loadCall = async () => {
    try {
      const data = await getCall(id);
      setCall(data.call);
      setScores(data.scores || []);
      setError(null);
      
      // Set default tab based on available data
      if (data.call?.summary && data.scores?.length > 0) {
        setActiveTab('summary'); // Default to summary
      } else if (data.scores?.length > 0) {
        setActiveTab('scores');
      } else if (data.call?.summary) {
        setActiveTab('summary');
      }
    } catch (err) {
      console.error('Failed to load call:', err);
      setError('Failed to load call details. Make sure backend is running.');
      toast.error('Failed to load call details');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleString();
  };

  const getSummary = () => {
    if (!call?.summary) return null;
    if (typeof call.summary === 'string') {
      try {
        return JSON.parse(call.summary);
      } catch {
        return null;
      }
    }
    return call.summary;
  };

  const getStatusColor = (status) => {
    const colors = {
      uploaded: 'bg-blue-100 text-blue-800',
      transcribing: 'bg-yellow-100 text-yellow-800',
      transcribed: 'bg-purple-100 text-purple-800',
      processing: 'bg-green-100 text-green-800',
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="text-destructive">{error}</div>
          </CardContent>
        </Card>
        <Button variant="outline" onClick={() => navigate('/')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>
    );
  }

  if (!call) {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="pt-6">
            <div>Call not found</div>
          </CardContent>
        </Card>
        <Button variant="outline" onClick={() => navigate('/')}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

  const summary = getSummary();
  const hasSummary = summary !== null;
  const hasScores = scores.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {call.original_filename || call.filename || 'Call Details'}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Uploaded {formatDate(call.created_at)}
            </p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(call.status)}`}>
          {call.status}
        </span>
      </div>

      {/* Two Column Layout: Transcript (left) and Tabs (right) */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Left Column: Transcript (2/3 width) */}
        <div className="flex flex-col w-full lg:w-2/3 gap-4">
          {call.transcript ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Transcript
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-6">
                <div className="max-h-[600px] overflow-y-auto p-4 bg-muted rounded-lg mb-4">
                  {call.transcript.split('\n').map((line, idx) => (
                    <p key={idx} className="mb-2 text-sm leading-relaxed">
                      {line}
                    </p>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center py-12">
                <div className="text-muted-foreground">
                  {call.status === 'transcribing' || call.status === 'processing' ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <p>Transcription in progress...</p>
                    </div>
                  ) : (
                    <p>Transcript not available</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column: Tabs (Summary/Scores) (1/3 width) */}
        <div className="flex flex-col w-full lg:w-1/3 gap-4">
          {(hasSummary || hasScores) && (
            <Card>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <CardHeader className="pb-3">
                  <TabsList className="grid w-full grid-cols-2">
                    {hasSummary && (
                      <TabsTrigger value="summary">Summary</TabsTrigger>
                    )}
                    {hasScores && (
                      <TabsTrigger value="scores">Scores</TabsTrigger>
                    )}
                  </TabsList>
                </CardHeader>
                <CardContent className="pb-6">
                  {/* Summary Tab */}
                  {hasSummary && (
                    <TabsContent value="summary" className="space-y-4 mt-0">
                      {summary.agenda && (
                        <div>
                          <h3 className="font-semibold mb-2 text-primary">Agenda</h3>
                          <p className="text-sm text-muted-foreground">{summary.agenda}</p>
                        </div>
                      )}

                      {summary.keyTopics && summary.keyTopics.length > 0 && (
                        <div>
                          <h3 className="font-semibold mb-2 text-primary">Key Topics</h3>
                          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                            {summary.keyTopics.map((topic, idx) => (
                              <li key={idx}>{topic}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {summary.actionItems && summary.actionItems.length > 0 && (
                        <div>
                          <h3 className="font-semibold mb-2 text-primary">Action Items</h3>
                          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                            {summary.actionItems.map((item, idx) => (
                              <li key={idx}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {summary.nextSteps && summary.nextSteps.length > 0 && (
                        <div>
                          <h3 className="font-semibold mb-2 text-primary">Next Steps</h3>
                          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                            {summary.nextSteps.map((step, idx) => (
                              <li key={idx}>{step}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </TabsContent>
                  )}

                  {/* Scores Tab */}
                  {hasScores && (
                    <TabsContent value="scores" className="mt-0">
                      <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 pb-4">
                        {scores.map((score) => (
                          <div key={score.id} className="border-l-4 border-primary pl-4 py-2 bg-accent/50 rounded">
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="font-semibold text-sm">{score.question_text}</h3>
                              <div className="flex items-center gap-2">
                                {score.score_value?.toLowerCase() === 'yes' ? (
                                  <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                                ) : score.score_value?.toLowerCase() === 'no' ? (
                                  <XCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                                ) : null}
                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                  score.score_value?.toLowerCase() === 'yes' 
                                    ? 'bg-green-100 text-green-800'
                                    : score.score_value?.toLowerCase() === 'no'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-blue-100 text-blue-800'
                                }`}>
                                  {score.score_value}
                                </span>
                              </div>
                            </div>
                            {score.category && (
                              <p className="text-xs text-muted-foreground mb-2 uppercase">
                                {score.category}
                              </p>
                            )}
                            {score.reason && (
                              <p className="text-xs text-muted-foreground">
                                <strong>Reason:</strong> {score.reason}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                  )}
                </CardContent>
              </Tabs>
            </Card>
          )}
        </div>
      </div>

      {/* Processing Status */}
      {(call.status === 'transcribing' || call.status === 'processing') && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-yellow-800">
              <Loader2 className="h-5 w-5 animate-spin" />
              <p>Processing in progress... This page will update automatically.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default CallDetail;
