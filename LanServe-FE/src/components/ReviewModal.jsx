import { useState, useEffect } from "react";
import { api } from "../lib/api";

export default function ReviewModal({ 
  isOpen, 
  onClose, 
  contractId, 
  projectId, 
  revieweeId, 
  revieweeName,
  onReviewSubmitted 
}) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [checking, setChecking] = useState(true);

  // Kiểm tra xem đã đánh giá chưa khi modal mở
  useEffect(() => {
    if (isOpen && projectId) {
      setChecking(true);
      api.get(`/api/reviews/check/${projectId}`)
        .then((res) => {
          setHasReviewed(res.data?.hasReviewed || false);
        })
        .catch((err) => {
          console.error("Check review error:", err);
          setHasReviewed(false);
        })
        .finally(() => {
          setChecking(false);
        });
    }
  }, [isOpen, projectId]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (hasReviewed) {
      alert("Bạn đã đánh giá project này rồi. Mỗi project chỉ có thể đánh giá 1 lần.");
      return;
    }

    if (!contractId || !projectId || !revieweeId) {
      alert("Thiếu thông tin để đánh giá.");
      return;
    }

    try {
      setLoading(true);
      const reviewData = {
        projectId,
        reviewerId: "", // Sẽ được lấy từ token ở backend
        revieweeId,
        rating,
        comment: comment.trim() || null,
      };

      const res = await api.post("/api/reviews", reviewData);
      console.log("✅ Review submitted:", res.data);
      
      alert("Đánh giá đã được gửi thành công!");
      
      // Reset form
      setRating(5);
      setComment("");
      setHasReviewed(true);
      
      // Callback để parent component có thể refresh data
      if (onReviewSubmitted) {
        onReviewSubmitted(res.data);
      }
      
      onClose();
    } catch (err) {
      console.error("Review submission error:", err);
      const errorMessage = err?.response?.data?.message || 
                           err?.response?.data?.detail ||
                           "Không thể gửi đánh giá. Vui lòng thử lại.";
      alert(errorMessage);
      
      // Nếu lỗi là đã đánh giá rồi, set hasReviewed = true
      if (errorMessage.includes("đã đánh giá")) {
        setHasReviewed(true);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Đánh giá {revieweeName || "người dùng"}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {checking ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Đang kiểm tra...</p>
          </div>
        ) : hasReviewed ? (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">Bạn đã đánh giá project này rồi.</p>
            <p className="text-sm text-gray-500">Mỗi project chỉ có thể đánh giá 1 lần.</p>
            <button
              onClick={onClose}
              className="mt-4 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
            >
              Đóng
            </button>
          </div>
        ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Rating Stars */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Đánh giá (1-5 sao)
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`text-3xl transition ${
                    star <= rating
                      ? "text-yellow-400"
                      : "text-gray-300"
                  } hover:text-yellow-400`}
                >
                  ★
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {rating === 5 && "Tuyệt vời"}
              {rating === 4 && "Tốt"}
              {rating === 3 && "Bình thường"}
              {rating === 2 && "Không hài lòng"}
              {rating === 1 && "Rất không hài lòng"}
            </p>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nhận xét (tùy chọn)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
              placeholder="Chia sẻ trải nghiệm của bạn..."
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1">
              {comment.length}/500 ký tự
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              disabled={loading}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-60"
              disabled={loading}
            >
              {loading ? "Đang gửi..." : "Gửi đánh giá"}
            </button>
          </div>
        </form>
        )}
      </div>
    </div>
  );
}

