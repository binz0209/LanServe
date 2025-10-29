import { useState } from "react";
import Input from "../../components/ui/input";
import Button from "../../components/ui/button";
import api from "../../lib/axios";
import { toast } from "sonner";

export default function Settings() {
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
            await api.post("/users/change-password", {
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
            <div className="lg:col-span-2 card p-5 space-y-6">
                {/* Thông báo */}
                <div>
                    <div className="font-semibold">Thông báo</div>
                    <div className="mt-2 space-y-2 text-sm">
                        <label className="flex items-center gap-2">
                            <input type="checkbox" defaultChecked /> Nhận thông báo qua email
                        </label>
                        <label className="flex items-center gap-2">
                            <input type="checkbox" /> Thông báo dự án mới
                        </label>
                        <label className="flex items-center gap-2">
                            <input type="checkbox" /> Thông báo tin nhắn
                        </label>
                    </div>
                </div>

                {/* Quyền riêng tư */}
                <div>
                    <div className="font-semibold">Quyền riêng tư</div>
                    <div className="mt-2 space-y-2 text-sm">
                        <label className="flex items-center gap-2">
                            <input type="checkbox" defaultChecked /> Hiển thị hồ sơ công khai
                        </label>
                        <label className="flex items-center gap-2">
                            <input type="checkbox" /> Hiển thị trạng thái online
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
