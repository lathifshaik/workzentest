"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Trophy, CheckCircle, Clock, MessageSquare, ArrowRight } from "lucide-react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"

interface TestSessionData {
  testSessionId: string;
  email: string;
  testName: string;
  companyName: string;
  duration: number;
  startTime: string;
  score?: number;
  status?: string;
  questionsCompleted?: number;
  token?: string;
}

export default function CompanyTestThankYouPage({ params }: { params: { sessionId: string } }) {
  // Unwrap params using React.use()
  const unwrappedParams = React.use(Promise.resolve(params));
  const sessionId = unwrappedParams.sessionId;
  const searchParams = useSearchParams()
  const router = useRouter()
  const [testSession, setTestSession] = useState<TestSessionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [feedback, setFeedback] = useState("")
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false)
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false)
  const [timeSpent, setTimeSpent] = useState<number | null>(null)
  const [testResults, setTestResults] = useState<{
    score: number;
    status: string;
    questionsCompleted: number;
  } | null>(null)
  
  // Get session info from URL params and localStorage
  const email = searchParams.get("email")
  const score = searchParams.get("score")
  const status = searchParams.get("status")
  const questionsCompleted = searchParams.get("questionsCompleted")

  useEffect(() => {
    // Get test session data from localStorage
    const loadTestData = () => {
      try {
        const storedData = localStorage.getItem('testSession');
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          // Check if this is the correct test session
          if (parsedData.testSessionId === sessionId) {
            setTestSession(parsedData);
            
            // Calculate time spent
            if (parsedData.startTime) {
              const startTime = new Date(parsedData.startTime).getTime();
              const endTime = new Date().getTime();
              const minutesSpent = Math.round((endTime - startTime) / (1000 * 60));
              setTimeSpent(Math.min(minutesSpent, parsedData.duration));
            }
            
            // Set test results from URL params or localStorage
            setTestResults({
              score: score ? parseInt(score) : (parsedData.score || 0),
              status: status || parsedData.status || 'completed',
              questionsCompleted: questionsCompleted ? parseInt(questionsCompleted) : (parsedData.questionsCompleted || 0)
            });
          }
        }
      } catch (err) {
        console.error('Error loading test data:', err);
        setError('Failed to load test data');
      } finally {
        setLoading(false);
      }
    };
    
    loadTestData();
  }, [sessionId, score, status, questionsCompleted]);
  
  // Redirect to login if no test session data is found
  useEffect(() => {
    if (!loading && !testSession) {
      router.push(`/company-test/${sessionId}/login`);
    }
  }, [loading, testSession, router, sessionId]);

  const handleSubmitFeedback = async () => {
    if (!feedback.trim() || !testSession?.email) return;

    setIsSubmittingFeedback(true);

    try {
      // Submit feedback to database
      await fetch(`/api/test-sessions/${sessionId}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: testSession.email, 
          feedback,
          testSessionId: sessionId
        })
      });
      
      setFeedbackSubmitted(true);
    } catch (error) {
      console.error("Failed to submit feedback:", error);
    } finally {
      setIsSubmittingFeedback(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading test results...</p>
        </div>
      </div>
    );
  }
  
  if (error || !testSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle>Something went wrong</CardTitle>
            <CardDescription>{error || 'Test session data not found'}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href={`/company-test/${sessionId}/login`}>Return to Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-32 h-32 bg-purple-300 rounded-full"></div>
        <div className="absolute top-40 right-32 w-24 h-24 bg-purple-200 rounded-full"></div>
        <div className="absolute bottom-32 left-1/4 w-40 h-40 bg-purple-300 rounded-full"></div>
        <div className="absolute bottom-20 right-20 w-28 h-28 bg-purple-200 rounded-full"></div>
      </div>

      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center space-x-2 mb-6">
              <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                <Trophy className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-semibold text-gray-900">WorkZen</span>
            </Link>
          </div>

          {/* Success Message */}
          <Card className="border border-gray-200 rounded-xl shadow-sm bg-white mb-8">
            <CardContent className="p-8 text-center">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>

              {testResults?.score && testResults.score >= 70 ? (
                <>
                  <h1 className="text-4xl font-bold text-green-600 mb-4 text-center">Congratulations!</h1>
                  <p className="text-2xl text-gray-800 font-medium mb-2 text-center">You've scored {testResults.score}% on your assessment.</p>
                  <p className="text-lg text-gray-700 mb-6 text-center">Our team will be in touch with you shortly to schedule your interview rounds.</p>
                </>
              ) : (
                <>
                  <h1 className="text-4xl font-bold text-gray-800 mb-4 text-center">Thank You</h1>
                  <p className="text-xl text-gray-700 mb-2 text-center">We appreciate your time and effort.</p>
                  <p className="text-lg text-gray-600 mb-3 text-center">We're sorry, but we're unable to proceed with your application at this time.</p>
                  <p className="text-lg text-gray-600 mb-6 text-center">Our team will review your application and may contact you for future opportunities that match your profile.</p>
                </>
              )}

              <div className="bg-purple-50 border border-purple-200 rounded-xl p-6 mb-6">
                <h3 className="font-semibold text-gray-900 mb-4">Test Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <div className="font-semibold text-purple-600">{testResults?.questionsCompleted || 'All'}</div>
                    <div className="text-gray-600">Questions Completed</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-purple-600">{timeSpent || testSession.duration} min</div>
                    <div className="text-gray-600">Time Spent</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-purple-600">{testSession.companyName}</div>
                    <div className="text-gray-600">Company</div>
                  </div>
                  {testResults?.score !== undefined && (
                    <div className="text-center col-span-3 mt-2 pt-4 border-t">
                      <div className="font-semibold text-purple-600 text-lg">{testResults.score}%</div>
                      <div className="text-gray-600">Your Score</div>
                      <div className={`mt-1 text-sm ${testResults.status === 'passed' ? 'text-green-600' : 'text-orange-500'}`}>
                        {testResults.status === 'passed' ? 'Passed' : 'Needs improvement'}
                      </div>
                    </div>
                  )}
                </div>
              </div>


            </CardContent>
          </Card>

          {/* Feedback Form */}
          <Card className="border border-gray-200 rounded-xl shadow-sm bg-white">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <MessageSquare className="w-6 h-6 text-purple-600" />
                <span>Share Your Feedback</span>
              </CardTitle>
              <CardDescription>Help us improve the assessment experience (optional)</CardDescription>
            </CardHeader>
            <CardContent>
              {!feedbackSubmitted ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="feedback">How was your experience with this assessment?</Label>
                    <Textarea
                      id="feedback"
                      placeholder="Share your thoughts about the test difficulty, interface, instructions, or any technical issues..."
                      rows={4}
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      className="border-gray-300 rounded-xl"
                    />
                  </div>

                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-600">Your feedback helps us create better assessment experiences</p>
                    <div className="flex space-x-3">
                      <Link href="/">
                        <Button
                          variant="outline"
                          className="border-gray-300 text-gray-700 hover:bg-gray-50 rounded-full bg-transparent"
                        >
                          Skip
                        </Button>
                      </Link>
                      <Button
                        onClick={handleSubmitFeedback}
                        disabled={!feedback.trim() || isSubmittingFeedback}
                        className="bg-purple-600 hover:bg-purple-700 text-white rounded-full px-6"
                      >
                        {isSubmittingFeedback ? "Submitting..." : "Submit Feedback"}
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
                  <h3 className="font-semibold text-gray-900 mb-2">Thank you for your feedback!</h3>
                  <p className="text-gray-600 mb-6">Your input helps us improve our platform.</p>
                  <Link href="/">
                    <Button className="bg-purple-600 hover:bg-purple-700 text-white rounded-full px-8">
                      Return to WorkZen
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center mt-8 text-gray-600">
            <p className="text-sm">
              Questions about your assessment? Contact{" "}
              <a href="mailto:uday@workzen.cc" className="text-purple-600 hover:text-purple-700">
                uday@workzen.cc
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
