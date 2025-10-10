'use client';

import { useState } from 'react';
import { Eye, EyeOff, Copy, Shield } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface PaymentInfo {
  bank_name: string;
  account_name: string;
  account_number_mask: string;
  account_number?: string; // Only available after verification
}

interface SecurePaymentInfoProps {
  paymentInfo: PaymentInfo;
  isOwner?: boolean;
  onRequestAccess?: () => void;
}

export default function SecurePaymentInfo({ 
  paymentInfo, 
  isOwner = false, 
  onRequestAccess 
}: SecurePaymentInfoProps) {
  const [showFullAccount, setShowFullAccount] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleRevealAccount = async () => {
    if (!isOwner && onRequestAccess) {
      onRequestAccess();
      return;
    }

    setIsVerifying(true);
    try {
      // Simulate verification process (fingerprint, PIN, etc.)
      await new Promise(resolve => setTimeout(resolve, 1500));
      setShowFullAccount(true);
      toast.success('Account details revealed');
    } catch (error) {
      toast.error('Verification failed');
    } finally {
      setIsVerifying(false);
    }
  };

  const copyAccountNumber = () => {
    if (paymentInfo.account_number) {
      navigator.clipboard.writeText(paymentInfo.account_number);
      toast.success('Account number copied!');
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="h-5 w-5 text-green-600" />
        <h3 className="font-semibold text-[#112e40]">Payment Information</h3>
        <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded">
          Secure
        </span>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-600">Bank Name</label>
          <p className="text-[#112e40] font-medium">{paymentInfo.bank_name}</p>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-600">Account Name</label>
          <p className="text-[#112e40] font-medium">{paymentInfo.account_name}</p>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-600">Account Number</label>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex-1 bg-gray-50 border rounded-lg px-3 py-2 font-mono">
              {showFullAccount && paymentInfo.account_number 
                ? paymentInfo.account_number 
                : paymentInfo.account_number_mask}
            </div>
            
            <button
              onClick={handleRevealAccount}
              disabled={isVerifying}
              className="p-2 text-gray-500 hover:text-gray-700 border rounded-lg hover:bg-gray-50 transition"
              title={showFullAccount ? "Hide account number" : "Reveal full account number"}
            >
              {isVerifying ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600"></div>
              ) : showFullAccount ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>

            {showFullAccount && paymentInfo.account_number && (
              <button
                onClick={copyAccountNumber}
                className="p-2 text-gray-500 hover:text-gray-700 border rounded-lg hover:bg-gray-50 transition"
                title="Copy account number"
              >
                <Copy className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {!isOwner && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <Shield className="h-4 w-4 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium">Security Protection</p>
                <p className="text-xs mt-1">
                  Account details are protected. Click the eye icon to request access.
                </p>
              </div>
            </div>
          </div>
        )}

        {isOwner && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <Shield className="h-4 w-4 text-green-600 mt-0.5" />
              <div className="text-sm text-green-800">
                <p className="font-medium">Your account is protected</p>
                <p className="text-xs mt-1">
                  Only you can reveal the full account number. Customers see a masked version until payment.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}