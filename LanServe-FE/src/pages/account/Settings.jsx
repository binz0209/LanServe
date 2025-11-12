import { useState, useEffect } from "react";
import Input from "../../components/ui/input";
import Button from "../../components/ui/button";
import api from "../../lib/axios";
import { toast } from "sonner";
import { useSettingsStore } from "../../stores/settingsStore";
import ImageUpload from "../../components/ImageUpload";

export default function Settings() {
    const { notifications, privacy, updateNotificationSettings, updatePrivacySettings } = useSettingsStore();
    const [user, setUser] = useState(null);
    const [avatarUrl, setAvatarUrl] = useState("");

    // Load user info và avatar
    useEffect(() => {
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        if (!token) return;

        api.get("/api/users/me")
            .then((res) => {
                setUser(res.data);
                setAvatarUrl(res.data?.avatarUrl || "");
            })
            .catch((err) => console.error("Get user error:", err));
    }, []);

    const handleAvatarUpload = async (url) => {
        try {
            await api.put(`/api/users/me`, { avatarUrl: url });
            setAvatarUrl(url);
            setUser({ ...user, avatarUrl: url });
            toast.success("Cập nhật avatar thành công!");
        } catch (err) {
            console.error("Update avatar error:", err);
            toast.error("Cập nhật avatar thất bại!");
        }
    };
    
    // Load settings từ backend khi component mount
    useEffect(() => {
        const loadSettings = async () => {
            try {
                const res = await api.get("/api/Users/me/settings");
                const settings = res.data;
                
                // Sync notification settings từ backend
                if (settings?.notificationSettings) {
                    if (settings.notificationSettings.emailNotifications !== undefined) {
                        updateNotificationSettings("emailNotifications", settings.notificationSettings.emailNotifications);
                    }
                    if (settings.notificationSettings.messageNotifications !== undefined) {
                        updateNotificationSettings("messageNotifications", settings.notificationSettings.messageNotifications);
                    }
                    if (settings.notificationSettings.newProjectNotifications !== undefined) {
                        updateNotificationSettings("newProjectNotifications", settings.notificationSettings.newProjectNotifications);
                    }
                }
                
                // Sync privacy settings từ backend
                if (settings?.privacySettings) {
                    if (settings.privacySettings.publicProfile !== undefined) {
                        updatePrivacySettings("publicProfile", settings.privacySettings.publicProfile);
                    }
                    if (settings.privacySettings.showOnlineStatus !== undefined) {
                        updatePrivacySettings("showOnlineStatus", settings.privacySettings.showOnlineStatus);
                    }
                }
            } catch (err) {
                console.error("Failed to load settings:", err);
            }
        };
        loadSettings();
    }, [updateNotificationSettings, updatePrivacySettings]);
    const [open, setOpen] = useState(false);
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const handleChangePassword = async () => {
        if (newPassword !== confirmPassword) {
            toast.error("Mật khẩu mới không khớp");
            return;
        }

        try {
            await api.post("/api/Users/change-password", {
                oldPassword,
                newPassword,
            });
            toast.success("Đổi mật khẩu thành công!");
            setOpen(false);
            setOldPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (err) {
            toast.error(err.response?.data?.message || "Đổi mật khẩu thất bại");
        }
    };

    return (
        <div className="grid lg:grid-cols-3 gap-6">
            {/* Cột trái */}
            <div className="lg:col-span-2 space-y-6">
                {/* Avatar */}
                <div className="card p-5">
                    <div className="font-semibold mb-3">Ảnh đại diện</div>
                    <div className="flex items-center gap-4">
                        {avatarUrl ? (
                            <img
                                src={avatarUrl}
                                alt="Avatar"
                                className="w-24 h-24 rounded-full object-cover"
                            />
                        ) : (
                            <div className="w-24 h-24 rounded-full bg-slate-200 flex items-center justify-center text-2xl">
                                👤
                            </div>
                        )}
                        <div>
                            <ImageUpload
                                folder="avatars"
                                onUploadSuccess={handleAvatarUpload}
                            />
                        </div>
                    </div>
                </div>

                <div className="card p-5 space-y-6">
                {/* Thông báo */}
                <div>
                    <div className="font-semibold">Thông báo</div>
                    <div className="mt-2 space-y-2 text-sm">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={notifications.emailNotifications}
                                onChange={async (e) => {
                                    const value = e.target.checked;
                                    updateNotificationSettings("emailNotifications", value);
                                    // Lưu lên backend
                                    try {
                                        await api.put("/api/Users/me/notification-settings", {
                                            emailNotifications: value,
                                            messageNotifications: notifications.messageNotifications,
                                            newProjectNotifications: notifications.newProjectNotifications,
                                        });
                                    } catch (err) {
                                        console.error("Failed to save settings:", err);
                                        toast.error("Không thể lưu cài đặt");
                                    }
                                }}
                                className="cursor-pointer"
                            />
                            Nhận thông báo qua email
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={notifications.newProjectNotifications}
                                onChange={async (e) => {
                                    const value = e.target.checked;
                                    updateNotificationSettings("newProjectNotifications", value);
                                    // Lưu lên backend
                                    try {
                                        await api.put("/api/Users/me/notification-settings", {
                                            emailNotifications: notifications.emailNotifications,
                                            messageNotifications: notifications.messageNotifications,
                                            newProjectNotifications: value,
                                        });
                                    } catch (err) {
                                        console.error("Failed to save settings:", err);
                                        toast.error("Không thể lưu cài đặt");
                                    }
                                }}
                                className="cursor-pointer"
                            />
                            Thông báo dự án mới
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={notifications.messageNotifications}
                                onChange={async (e) => {
                                    const value = e.target.checked;
                                    updateNotificationSettings("messageNotifications", value);
                                    // Lưu lên backend
                                    try {
                                        await api.put("/api/Users/me/notification-settings", {
                                            emailNotifications: notifications.emailNotifications,
                                            messageNotifications: value,
                                            newProjectNotifications: notifications.newProjectNotifications,
                                        });
                                    } catch (err) {
                                        console.error("Failed to save settings:", err);
                                        toast.error("Không thể lưu cài đặt");
                                    }
                                }}
                                className="cursor-pointer"
                            />
                            Thông báo tin nhắn
                        </label>
                    </div>
                </div>

                {/* Quyền riêng tư */}
                <div>
                    <div className="font-semibold">Quyền riêng tư</div>
                    <div className="mt-2 space-y-2 text-sm">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={privacy.publicProfile}
                                onChange={async (e) => {
                                    const value = e.target.checked;
                                    updatePrivacySettings("publicProfile", value);
                                    // Lưu lên backend
                                    try {
                                        await api.put("/api/Users/me/privacy-settings", {
                                            publicProfile: value,
                                            showOnlineStatus: privacy.showOnlineStatus,
                                        });
                                    } catch (err) {
                                        console.error("Failed to save privacy settings:", err);
                                        toast.error("Không thể lưu cài đặt quyền riêng tư");
                                    }
                                }}
                                className="cursor-pointer"
                            />
                            Hiển thị hồ sơ công khai
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={privacy.showOnlineStatus}
                                onChange={async (e) => {
                                    const value = e.target.checked;
                                    updatePrivacySettings("showOnlineStatus", value);
                                    // Lưu lên backend
                                    try {
                                        await api.put("/api/Users/me/privacy-settings", {
                                            publicProfile: privacy.publicProfile,
                                            showOnlineStatus: value,
                                        });
                                    } catch (err) {
                                        console.error("Failed to save privacy settings:", err);
                                        toast.error("Không thể lưu cài đặt quyền riêng tư");
                                    }
                                }}
                                className="cursor-pointer"
                            />
                            Hiển thị trạng thái online
                        </label>
                    </div>
                </div>

                {/* Bảo mật */}
                <div>
                    <div className="font-semibold">Bảo mật</div>
                    <Button variant="outline" className="mt-2" onClick={() => setOpen(true)}>
                        Đổi mật khẩu
                    </Button>
                    </div>
                </div>
            </div>

            {/* Cột phải */}
            <div className="card p-5">
                <div className="font-semibold">Trạng thái tài khoản</div>
                <ul className="mt-3 text-sm space-y-2">
                    <li>✅ Tài khoản đã xác thực</li>
                    <li>✅ Email đã xác nhận</li>
                    <li>✅ Số điện thoại đã xác nhận</li>
                </ul>
            </div>

            {/* Modal Đổi mật khẩu */}
            {open && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
                    <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
                        <h2 className="text-xl font-semibold mb-4">Đổi mật khẩu</h2>

                        <div className="space-y-3">
                            <div>
                                <label className="text-sm">Mật khẩu cũ</label>
                                <Input
                                    type="password"
                                    value={oldPassword}
                                    onChange={(e) => setOldPassword(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="text-sm">Mật khẩu mới</label>
                                <Input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="text-sm">Xác nhận mật khẩu mới</label>
                                <Input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <Button variant="outline" onClick={() => setOpen(false)}>
                                Hủy
                            </Button>
                            <Button onClick={handleChangePassword}>Lưu</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
