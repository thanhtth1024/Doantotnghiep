from typing import Any, Text, Dict, List

import requests
from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher


BACKEND_URL = "http://localhost:3000"


class ActionPersonalizedHelp(Action):
    def name(self) -> Text:
        return "action_personalized_help"

    def run(
        self,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: Dict[Text, Any],
    ) -> List[Dict[Text, Any]]:
        intent = tracker.latest_message.get("intent", {}).get("name")
        metadata = tracker.latest_message.get("metadata", {}) or {}
        access_token = metadata.get("access_token")

        if intent == "ask_order":
            if not access_token:
                dispatcher.utter_message(text="Bạn hãy đăng nhập để tôi có thể kiểm tra đơn hàng của bạn.")
                return []
            self._answer_orders(dispatcher, access_token)
            return []

        if intent in {"ask_products", "ask_price"}:
            self._answer_products(dispatcher, tracker.latest_message.get("text", ""), intent)
            return []

        dispatcher.utter_message(text="Bạn có thể hỏi tôi về sản phẩm, giá, đơn hàng hoặc giao hàng.")
        return []

    def _answer_orders(self, dispatcher: CollectingDispatcher, access_token: str) -> None:
        try:
            response = requests.get(
                f"{BACKEND_URL}/orders/my-orders",
                headers={"Authorization": f"Bearer {access_token}"},
                timeout=5,
            )
            response.raise_for_status()
            orders = response.json()
            if not orders:
                dispatcher.utter_message(text="Bạn chưa có đơn hàng nào.")
                return
            latest = orders[0]
            dispatcher.utter_message(
                text=(
                    f"Đơn gần nhất của bạn là #{latest.get('id')}, "
                    f"trạng thái: {latest.get('status')}, "
                    f"tổng tiền: {latest.get('totalAmount', 0)}đ. "
                    "Bạn có thể mở mục Đơn hàng để xem chi tiết."
                )
            )
        except requests.RequestException:
            dispatcher.utter_message(text="Tôi chưa kết nối được với dữ liệu đơn hàng. Bạn thử lại sau nhé.")

    def _answer_products(self, dispatcher: CollectingDispatcher, query: str, intent: str) -> None:
        try:
            response = requests.get(f"{BACKEND_URL}/products", timeout=5)
            response.raise_for_status()
            products = response.json()
            words = [word.lower() for word in query.split() if len(word) > 2]
            matches = [product for product in products if any(word in product.get("name", "").lower() for word in words)]
            suggestions = matches[:3] or products[:3]
            if not suggestions:
                dispatcher.utter_message(text="Hiện chưa có sản phẩm phù hợp để gợi ý.")
                return
            lines = []
            for product in suggestions:
                price = float(product.get("price", 0)) - float(product.get("discount", 0) or 0)
                lines.append(f"{product.get('name')} ({price:,.0f}đ, còn {product.get('stock', 0)})")
            prefix = "Tôi tìm thấy" if intent == "ask_products" else "Một số mức giá hiện tại là"
            dispatcher.utter_message(text=f"{prefix}: " + "; ".join(lines) + ".")
        except (requests.RequestException, ValueError, TypeError):
            dispatcher.utter_message(text="Tôi chưa lấy được danh sách sản phẩm. Bạn thử lại sau nhé.")