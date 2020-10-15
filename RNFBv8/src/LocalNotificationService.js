import PushNotification from 'react-native-push-notification';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import { Platform } from 'react-native';

class LocalNotificationService {

    configure = (onOpenNotification) => {
        PushNotification.configure({
            onRegister: function (token) {
                console.log("[LocalNotificationService] onRegister", token);
            },
            onNotification: function (notification) {
                console.log("[LocalNotificationService] onNotification", notification);
                if (!notification?.data) {
                    return
                }
                notification.userInteraction = true;
                onOpenNotification(Platform.OS === 'ios' ? notification.data.item : notification.data);

                if (Platform.OS == "ios") {
                    notification.finish(PushNotificationIOS.FetchResult.NoData)
                }
            },

            // IOS ONLY (optional): default: all - Permissions to register.
            permissions: {
                alert: true,
                badge: true,
                sound: true,
            },

            // Should the initial notification be popped automatically
            // default: true
            popInitialNotification: true,

            /**
             * (optional) default: true
             * - Specified if permissions (ios) and token (android and ios) will requested or not,
             * - if not, you must call PushNotificationsHandler.requestPermissions() later
             * - if you are not using remote notification or do not have Firebase installed, use this:
             *     requestPermissions: Platform.OS === 'ios'
             */
            requestPermissions: true,
        })
    }
    unregister = () => {
        PushNotification.unregister()
    }
    showNotification = (id, title,message, data = {}, options = {}) => {
        console.log("[LocalNotificationService] showNotification");
        PushNotification.localNotification({
            ...this.buildAndroidNotification(id, title,message, data, options),
            ...this.buildIOSNotification(id, title,message, data, options),
            title: title || "",
            message: message || "",
            playSound: options.playSound || false,
            soundName: options.soundName || 'default',
            userInteraction: true

        });

    }
    buildAndroidNotification = (id, title, message, data = {}, options = {}) => {
        return {
            id: id,
            autoCancel: true,
            largeIcon: options.largeIcon || "ic_launcher",
            smallIcon: options.smallIcon || "ic_notification",
            bigText: message || "",
            subText: title || "",
            vibrate: options.vibrate || true,
            vabration: options.vabration || 300,
            priority: options.priority || "high",
            importance: options.importance || "high",
            data: data,
        }
    }
    buildIOSNotification = (id, title, message, data = {}, options = {}) => {
        return {
            alertAction: options.alertAction || "view",
            category: options.category || "",
            userInfo: {
                id: id,
                item: data
            }
        }
    }

    cancelAllLocalNotifications = () => {
        if (Platform.OS === "ios") {
            PushNotificationIOS.removeAllDeliveredNotifications();
        } else {
            PushNotification.cancelAllLocalNotifications();
        }
    }

    removeDeliveredNotificationID = (notificationId) => {
        console.log("[LocalNotificationService] removeDeliveredNotificationID: ", notificationId);

        PushNotification.cancelLocalNotifications({ id: `${notificationId}` })

    }



}

export const localNotificationService = new LocalNotificationService();
